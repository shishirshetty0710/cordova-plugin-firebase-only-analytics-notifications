var fs = require("fs");
var path = require("path");

function rootBuildGradleExists() {
  var target = path.join("platforms", "android", "build.gradle");
  return fs.existsSync(target);
}

/*
 * Helper function to read the build.gradle that sits at the root of the project
 */
function readRootBuildGradle() {
  var target = path.join("platforms", "android", "build.gradle");
  return fs.readFileSync(target, "utf-8");
}

/*
 * Added a dependency on 'com.google.gms' based on the position of the know 'com.android.tools.build' dependency in the build.gradle
 */
function addDependencies(buildGradle, context) {
  // find the known line to match
  var match = buildGradle.match(/^(\s*)classpath "com.android.tools.build(.*)/m);
  var whitespace = match[1];
  
  // modify the line to add the necessary dependencies
  var googlePlayDependency;
  var fabricDependency;

  googlePlayDependency = whitespace + 'classpath \'com.google.gms:google-services:4.3.3\' // google-services dependency from cordova-plugin-firebase';
  fabricDependency = whitespace + 'classpath \'com.google.firebase:firebase-crashlytics-gradle:2.4.1\' // fabric dependency from cordova-plugin-firebase';
  
  var modifiedLine = match[0] + '\n' + googlePlayDependency + '\n' + fabricDependency;

  // modify the actual line
  var modifiedGradle = buildGradle.replace(/^(\s*)classpath "com.android.tools.build(.*)/m, modifiedLine);

  return modifiedGradle;
}

/*
 * Helper function to write to the build.gradle that sits at the root of the project
 */
function writeRootBuildGradle(contents) {
  var target = path.join("platforms", "android", "build.gradle");
  fs.writeFileSync(target, contents);
}

module.exports = {

  modifyRootBuildGradle: function(context) {
    // be defensive and don't crash if the file doesn't exist
    if (!rootBuildGradleExists) {
      return;
    }

    // Add Google Play Services Dependency
    var buildGradle = readRootBuildGradle();
    buildGradle = addDependencies(buildGradle, context);
  
    writeRootBuildGradle(buildGradle);
  },

  restoreRootBuildGradle: function() {
    // be defensive and don't crash if the file doesn't exist
    if (!rootBuildGradleExists) {
      return;
    }

    var buildGradle = readRootBuildGradle();

    // remove any lines we added
    buildGradle = buildGradle.replace(/(?:^|\r?\n)(.*)cordova-plugin-firebase*?(?=$|\r?\n)/g, '');

    writeRootBuildGradle(buildGradle);
  }
};