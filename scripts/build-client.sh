# client-dist/js cannot exist! delete before running
# written to run in root dir

# css ----------------------------------

cat public/css/main.css >> public/css/bundle.css
cat public/css/index.css >> public/css/bundle.css
cat public/css/not-found.css >> public/css/bundle.css
cat public/css/settings.css >> public/css/bundle.css
cat public/css/modal.css >> public/css/bundle.css
cat public/css/notifications.css >> public/css/bundle.css

# html & others ------------------------

echo "Things to do:"
echo "1. Update the <link> and <script> tags in index.html"
echo "2. Enable service worker and set app version & files"
echo "3. Copy Google fonts into the css file"
echo "4. Remove elements inside of div#root and add them in js"
echo "5. Optimize View's constructor"
echo "6. Run JS through Babel for compatibility"
echo "7. Minify html, css, js"
echo "8. Change the chrome extension host in .html and main.js"
