import { HOST, FILE_HOST } from './host.js'

export default [
    {
        pid: 'Basic',
        name: '基础',
        name_en: 'Basic',
        children: [

            {
                id: 'chartsMap',
                name: '加载参数',
                author: 'z2586300277',
                codeUrl: HOST + 'demos/chartsMap.js',
                image: HOST + 'demos/chartMap.png',
            },
            {
                id: 'rawThree',
                name: '原生three.js开发',
                author: 'z2586300277',
                codeUrl: HOST + 'demos/rawThree.js',
                image: HOST + 'demos/rawThree.jpg',
            },
            {
                id: 'zhxq',
                name: '智慧小区',
                author: 'z2586300277',
                openUrl: 'https://openthree.github.io/market/' + 'zhxq/index.html',
                image: 'https://openthree.github.io/market/' + 'zhxq/index.png',
            },
            {
                id: 'jkpt',
                name: '监控平台',
                author: 'z2586300277',
                openUrl: 'https://openthree.github.io/market/' + 'jkpt/index.html',
                image: 'https://openthree.github.io/market/' + 'jkpt/index.png',
            },

        ]
    }

]