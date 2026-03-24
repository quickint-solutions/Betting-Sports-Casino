module.exports = {
    // name
    name: 'mytools',

    // folders
    pub: 'public',
    app: 'public/app',
    test: 'test',
    generatedJs: '.generated/js/public/app',

    // theme: 'sky',
    //theme: 'lotus',
    //theme: 'dimd',
    //theme: 'bking',
    theme: 'sports',
    // theme: 'dimd2',


    constants: '',
    dist: 'dist/' + '<%= config.constants.WebApp %>',
    publish: 'publish',

    //ports
    appPort: 9002,
    testPort: 9102,
    livereload: 9902,

    // flags
    enableLivereload: true
};