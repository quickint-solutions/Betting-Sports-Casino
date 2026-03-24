module.exports = {
    options: {
        dest: 'docs',
        title: 'Betting Mall',
        styles: ['docs/custom/hohr-docs.css'],
        template: 'docs/custom/index.tmpl'
    },
    all: ['<%= config.generatedJs %>/**/*.js']
}