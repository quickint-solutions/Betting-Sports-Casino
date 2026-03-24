module.exports = {
    options: {
        configuration: "tslint.json",
        formatter:'msbuild'        
    },
    files: {
        src: [
            "public/app/**/*.ts",
            "!public/app/**/*.d.ts",
            "!public/app/**/hohrMaskDirective.ts"
        ]
    }
}