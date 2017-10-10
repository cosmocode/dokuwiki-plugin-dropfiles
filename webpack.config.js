/* eslint-disable */
/* global process */

// fix for https://github.com/webpack/webpack/issues/2537
if (process.argv.indexOf('-p') !== -1) {
    process.env.NODE_ENV = 'production';
}

module.exports = {
    entry: './src/upload.js',
    output: {
        filename: './dist/bundle.js',
    },
    module: {
        rules: [
            {
                loader: 'eslint-loader',
                options: {
                    fix: true,
                },
            },
        ],
    },
    plugins: [
    ],
};
