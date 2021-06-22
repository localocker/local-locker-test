module.exports = {
    plugins: [
        'postcss-preset-env',
        require("tailwindcss")("./tailwind.config.js"),
        require("autoprefixer")
    ]
};