# written to run in root dir

# ----- js
cat public/js/TimingEngine.js > extensions/chrome/js/TimingEngine.js
cat public/js/Canvas.js > extensions/chrome/js/Canvas.js
cat public/js/Logger.js > extensions/chrome/js/Logger.js
cat public/js/ScheduleBuilder.js > extensions/chrome/js/ScheduleBuilder.js
cat public/js/PrefManager.js > extensions/chrome/js/PrefManager.js
cat public/js/Storage.js > extensions/chrome/js/Storage.js

# ----- css
cat public/css/main.css > extensions/chrome/css/main.css
cat public/css/index.css > extensions/chrome/css/index.css

# ----- images
cp -rf public/images/ extensions/chrome/images/