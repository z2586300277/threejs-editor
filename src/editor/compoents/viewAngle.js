import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap';
import * as THREE from 'three';
import { ElMessage } from 'element-plus';

export default {
    name: '记录场景视角组件',
    label: '记录场景视角组件',
    create(storage, { controls, transformControls }) {

        // 注入一次全局样式，避免大量内联样式（精简 + 美观）
        if (!document.getElementById('view-angle-style')) {
            const style = document.createElement('style');
            style.id = 'view-angle-style';
            style.textContent = `
            .va-panel{display:flex;gap:8px;padding:6px 10px;backdrop-filter:blur(8px) saturate(1.2);border:1px solid rgba(255,255,255,.08);border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.35);font-family:'Microsoft YaHei',sans-serif;pointer-events:auto;}
            .va-btn{all:unset;cursor:pointer;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:.5px;color:#eef4ff;position:relative;overflow:hidden;line-height:1;transition:.25s;background:linear-gradient(135deg,#3b82f6,#2563eb);box-shadow:0 2px 6px rgba(0,0,0,.35);}
            .va-btn.restore{background:linear-gradient(135deg,#10b981,#059669);}
            .va-btn::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.28),transparent 60%);mix-blend-mode:overlay;pointer-events:none;}
            .va-btn:hover{transform:translateY(-2px);filter:brightness(1.15);}
            .va-btn:active{transform:translateY(0) scale(.95);filter:brightness(.95);}
            .va-btn.disabled{opacity:.35;cursor:not-allowed;transform:none !important;filter:none !important;}
            `;
            document.head.appendChild(style);
        }

        const wrap = document.createElement('div');
        wrap.className = 'va-panel';

        const btnSave = document.createElement('button');
        btnSave.className = 'va-btn save';
        btnSave.textContent = '保存';

        const btnRestore = document.createElement('button');
        btnRestore.className = 'va-btn restore';
        btnRestore.textContent = '查看';

        wrap.append(btnSave, btnRestore);

     

        const label = new CSS2DObject(wrap);
        label.position.set(0, 2, 0);
           wrap.addEventListener('click', (e) => {
            transformControls.attach(label);
            e.stopPropagation();
        });
        let saved = storage?.view || null;
        label.view = saved;

        function updateRestoreState() {
            if (!saved) btnRestore.classList.add('disabled'); else btnRestore.classList.remove('disabled');
        }

        function captureView() {
            const cam = controls.object;
            saved = { position: cam.position.toArray(), target: controls.target.toArray() };
            label.view = saved;
            ElMessage.success('视角已保存进组件！');
            updateRestoreState();
        }

        function applyView() {
            if (!saved) return; // 无数据
            const cam = controls.object;
            const [px, py, pz] = saved.position;
            const [tx, ty, tz] = saved.target;
            gsap.to(cam.position, { duration: 1, x: px, y: py, z: pz, ease: 'power2.inOut' });
            gsap.to(controls.target, { duration: 1, x: tx, y: ty, z: tz, ease: 'power2.inOut' });
        }

        btnSave.onclick = (e) => { e.stopPropagation(); captureView(); };
        btnRestore.onclick = (e) => { e.stopPropagation(); applyView(); };

        updateRestoreState();

        return label;
    },

    getStorage(mesh) {
        return { view: mesh.view };
    }
};