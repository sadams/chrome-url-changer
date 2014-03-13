module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-crx');
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    crx: {
      myPublicPackage: {
        "src": "src/",
        "privateKey": "chrome-url-changer.pem",
        "dest": "dist/crx/"
      }
    },
    mkdirs: {
      dirs: [
        'dist/crx'
      ]
    }
  });

  grunt.registerMultiTask('mkdirs', 'Create directories', function() {
    grunt.util.recurse(this.data, function(elem) {
      grunt.log.writeln('Creating directory: ' + elem);
      grunt.file.mkdir(elem);
    });
  });


  // Default task(s).
  grunt.registerTask('default', ['mkdirs', 'crx']);

};
