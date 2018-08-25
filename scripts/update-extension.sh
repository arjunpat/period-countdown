# written to run in root dir

# ----- css
cat public/css/main.css > extensions/chrome/css/main.css
cat public/css/index.css > extensions/chrome/css/index.css

# ----- images
cp -rf public/images/ extensions/chrome/images/