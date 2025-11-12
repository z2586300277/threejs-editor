
import { ElForm, ElFormItem, ElInput, ElDatePicker, ElSelect, ElOption, ElButton, ElRadioGroup, ElRadio } from 'element-plus';
import { createApp, h, ref } from 'vue';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';

export default {
    name: 'ui-表单',
    label: 'ui-表单',

    create() {

        const FormComponent = {
            setup() {
                const form = ref({
                    name: '',
                    date: '',
                    gender: '男',
                    city: '',
                    description: ''
                });

                const onSubmit = () => {
                    console.log('提交表单:', form.value);
                    alert('表单已提交！');
                };

                const onReset = () => {
                    form.value = {
                        name: '',
                        date: '',
                        gender: '男',
                        city: '',
                        description: ''
                    };
                };

                return () => h('div', {
                    style: {
                        width: '350px',
                        padding: '20px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #e4e7ed'
                    }
                }, [
                    h('h3', {
                        style: {
                            margin: '0 0 20px 0',
                            color: '#303133',
                            fontSize: '18px',
                            textAlign: 'center'
                        }
                    }, '用户信息表单'),

                    h(ElForm, {
                        model: form.value,
                        labelWidth: '80px',
                        size: 'default'
                    }, () => [
                        // 姓名输入框
                        h(ElFormItem, { label: '姓名' }, () =>
                            h(ElInput, {
                                modelValue: form.value.name,
                                'onUpdate:modelValue': (val) => { form.value.name = val; },
                                placeholder: '请输入姓名'
                            })
                        ),

                        // 日期选择器
                        h(ElFormItem, { label: '出生日期' }, () =>
                            h(ElDatePicker, {
                                modelValue: form.value.date,
                                'onUpdate:modelValue': (val) => { form.value.date = val; },
                                type: 'date',
                                placeholder: '选择日期',
                                style: { width: '100%' }
                            })
                        ),

                        // 性别选择
                        h(ElFormItem, { label: '性别' }, () =>
                            h(ElRadioGroup, {
                                modelValue: form.value.gender,
                                'onUpdate:modelValue': (val) => { form.value.gender = val; }
                            }, () => [
                                h(ElRadio, { label: '男' }, () => '男'),
                                h(ElRadio, { label: '女' }, () => '女')
                            ])
                        ),

                        // 城市选择
                        h(ElFormItem, { label: '城市' }, () =>
                            h(ElSelect, {
                                modelValue: form.value.city,
                                'onUpdate:modelValue': (val) => { form.value.city = val; },
                                placeholder: '请选择城市',
                                style: { width: '100%' }
                            }, () => [
                                h(ElOption, { label: '北京', value: 'beijing' }),
                                h(ElOption, { label: '上海', value: 'shanghai' }),
                                h(ElOption, { label: '广州', value: 'guangzhou' }),
                                h(ElOption, { label: '深圳', value: 'shenzhen' })
                            ])
                        ),

                        // 描述文本域
                        h(ElFormItem, { label: '描述' }, () =>
                            h(ElInput, {
                                modelValue: form.value.description,
                                'onUpdate:modelValue': (val) => { form.value.description = val; },
                                type: 'textarea',
                                rows: 3,
                                placeholder: '请输入描述'
                            })
                        ),

                        // 按钮组
                        h(ElFormItem, {
                            style: { textAlign: 'center', marginBottom: '0' }
                        }, () => [
                            h(ElButton, {
                                type: 'primary',
                                onClick: onSubmit,
                                style: { marginRight: '10px' }
                            }, () => '提交'),
                            h(ElButton, {
                                onClick: onReset
                            }, () => '重置')
                        ])
                    ])
                ]);
            }
        };

        const app = createApp(FormComponent)

        const mountPoint = document.createElement('div')
        app.mount(mountPoint)

        const mesh = new CSS3DObject(mountPoint.firstElementChild);
        mesh.position.y += 300
        const box = new THREE.BoxGeometry(350, 150, 100)
        const material = new THREE.MeshBasicMaterial({ color: 'yellow', visible: false });
        const m = new THREE.Mesh(box, material);
        const group = new THREE.Group();
        group.add(m);
        group.add(mesh)

        group.REMOVECALL = () => {
            group.remove(mesh);
        }

        return group

    }

}

