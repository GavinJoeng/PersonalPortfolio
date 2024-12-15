module.exports = {
    plugins: {
        'postcss-import': {}, // 新增插件，處理多個文件的合併
        tailwindcss: {},      // 保留 TailwindCSS
        autoprefixer: {},     // 保留自動前綴
    },
};
