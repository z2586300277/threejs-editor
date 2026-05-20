import { createApp, h, reactive, watchEffect } from 'vue';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three';

export default {
    name: '热点信息',
    label: '热点信息',

    // 默认配置
    defaultConfig: {
        title: '热点配置' + Math.floor(Math.random() * 100),
        description: '这就是三维编辑器的热点配置组件, 在热点列表点击编辑即可修改内容。',
        mediaUrl: 'https://z2586300277.github.io/3d-file-server/images/editor.jpg',
        mediaType: 'image',
        cardWidth: 260,
        cardHeight: null, // null为自适应
        mediaAspect: null, // 新增：媒体宽高比（w/h）
    },

    create(storage) {
        // 响应式配置
        const options = reactive({ ...this.defaultConfig, ...storage?.INFO_CONFIG });
        const group = new THREE.Group();

        // 容器
        const container = document.createElement('div');
        container.style.cssText = 'position:relative;pointer-events:auto;cursor:pointer;';

        // 热点圆点
        const hotspot = document.createElement('div');
        hotspot.innerHTML = `
            <div style="width:18px;height:18px;background:radial-gradient(#fff 25%,#00d4ff 60%,transparent);border-radius:50%;box-shadow:0 0 14px #00d4ff,0 0 6px #00d4ff;"></div>
            <style>@keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}</style>
        `;
        hotspot.style.cssText = 'animation:blink 1.5s infinite;position:relative;z-index:1;';
        container.appendChild(hotspot);

        // 卡片+折线容器
        const cardWrap = document.createElement('div');
        cardWrap.style.cssText = 'position:absolute;left:9px;top:9px;display:none;';
        cardWrap.innerHTML = `
            <svg style="position:absolute;left:0;top:0;overflow:visible;" width="60" height="120">
                <path d="M 0 0 L 0 -120 L 60 -120" stroke="#00d4ff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="0" cy="0" r="3" fill="#00d4ff"/>
            </svg>
        `;

        // 卡片 - 使用响应式数据
        const cardEl = document.createElement('div');
        cardEl.style.cssText = 'position:absolute;left:60px;top:-120px;transform:translateY(-50%);';
        
        const app = createApp({
            setup() {
                return () => {
                    const hasMedia = !!options.mediaUrl;
                    const isVideo = options.mediaType === 'video';
                    // 根据卡片宽度与媒体宽高比计算高度（去除左右 14px 内边距）
                    const contentWidth = Math.max(0, (options.cardWidth || 260) - 28);
                    const mediaHeight = options.mediaAspect ? Math.max(80, Math.round(contentWidth / options.mediaAspect)) : 120;

                    return h('div', {
                        style: {
                            width: options.cardWidth + 'px',
                            height: options.cardHeight ? options.cardHeight + 'px' : 'auto',
                            minWidth: '180px', minHeight: '80px',
                            padding: '14px', color: '#fff',
                            background: 'linear-gradient(145deg,rgba(15,25,45,.95),rgba(30,50,75,.92))',
                            borderRadius: '4px 12px 12px 12px',
                            border: '1px solid rgba(0,212,255,.3)',
                            boxShadow: '0 0 20px rgba(0,212,255,.15),0 8px 32px rgba(0,0,0,.5)',
                            fontFamily: 'PingFang SC,Microsoft YaHei,sans-serif',
                            backdropFilter: 'blur(8px)',
                            position: 'relative',
                            overflow: 'hidden',
                        }
                    }, [
                        h('div', {
                            style: {
                                fontSize: '18px', fontWeight: '600', marginBottom: '10px', paddingBottom: '8px',
                                borderBottom: '1px solid rgba(0,212,255,.25)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                overflowWrap: 'anywhere', wordBreak: 'break-word'
                            }
                        }, [
                            h('span', { style: { width: '4px', height: '14px', background: 'linear-gradient(180deg,#00d4ff,#0066ff)', borderRadius: '2px' } }),
                            options.title
                        ]),
                        hasMedia && h('div', {
                            style: {
                                borderRadius: '6px',
                                overflow: 'hidden',
                                marginBottom: '10px',
                                border: '1px solid rgba(255,255,255,.1)',
                                width: '100%',
                                height: mediaHeight + 'px',
                                background: 'rgba(0,0,0,.2)'
                            }
                        }, [
                            h(isVideo ? 'video' : 'img', {
                                src: options.mediaUrl,
                                controls: isVideo,
                                style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
                                // 加载后获取真实尺寸并计算宽高比
                                onLoadedmetadata: isVideo ? (e) => {
                                    const vw = e.target.videoWidth, vh = e.target.videoHeight;
                                    if (vw && vh) options.mediaAspect = vw / vh;
                                } : undefined,
                                onLoad: !isVideo ? (e) => {
                                    const iw = e.target.naturalWidth, ih = e.target.naturalHeight;
                                    if (iw && ih) options.mediaAspect = iw / ih;
                                } : undefined,
                            })
                        ]),
                        options.description && h('div', {
                            style: {
                                fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,.75)', textAlign: 'justify',
                                whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word'
                            }
                        }, options.description),
                        // 缩放手柄
                        h('div', {
                            style: {
                                position: 'absolute', right: '0', bottom: '0',
                                width: '16px', height: '16px', cursor: 'se-resize',
                                background: 'linear-gradient(135deg, transparent 40%, rgba(0,212,255,.5) 40%, rgba(0,212,255,.8) 60%, transparent 60%)',
                            },
                            onMousedown: (e) => {
                                e.stopPropagation();
                                const startX = e.clientX, startY = e.clientY;
                                const startW = options.cardWidth, startH = options.cardHeight || e.target.parentElement.offsetHeight;
                                const onMove = (ev) => {
                                    options.cardWidth = Math.max(180, startW + ev.clientX - startX);
                                    options.cardHeight = Math.max(80, startH + ev.clientY - startY);
                                };
                                const onUp = () => {
                                    document.removeEventListener('mousemove', onMove);
                                    document.removeEventListener('mouseup', onUp);
                                };
                                document.addEventListener('mousemove', onMove);
                                document.addEventListener('mouseup', onUp);
                            }
                        })
                    ]);
                };
            }
        });
        app.mount(cardEl);
        cardWrap.appendChild(cardEl);
        container.appendChild(cardWrap);

        // 悬浮显示/移出延迟隐藏
        let hideTimer = null;
        container.onmouseenter = () => {
            clearTimeout(hideTimer);
            cardWrap.style.display = 'block';
            cardWrap.style.animation = 'fadeIn .3s ease';
        };
        container.onmouseleave = () => {
            hideTimer = setTimeout(() => cardWrap.style.display = 'none', 5000);
        };

        const style = document.createElement('style');
        style.textContent = `@keyframes fadeIn{from{opacity:0;transform:translateY(-50%) translateX(-10px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}`;
        container.appendChild(style);

        const label = new CSS2DObject(container);
        label.center.set(0.5, 0.5);
        group.add(label);

        group.BINDCOMPONENT = this;
        group.INFO_CONFIG = options; // 响应式对象，直接修改即可刷新视图
        group.REMOVECALL = () => { app.unmount(); group.remove(label); };

        return group;
    },

    getStorage: function (m) {
        const { INFO_CONFIG } = m;
        return {
            INFO_CONFIG: {
                title: INFO_CONFIG.title,
                description: INFO_CONFIG.description,
                mediaUrl: INFO_CONFIG.mediaUrl,
                mediaType: INFO_CONFIG.mediaType,
                cardWidth: INFO_CONFIG.cardWidth,
                cardHeight: INFO_CONFIG.cardHeight,
                mediaAspect: INFO_CONFIG.mediaAspect, // 可选持久化（不依赖也能自适应）
            }
        }
    }
};