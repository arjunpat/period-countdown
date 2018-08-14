# client-dist/js cannot exist! delete before running


# javascript ---------------------------
mkdir -p client-dist/js

for filename in public/js/*; do
	if [ $filename != "public/js/main.js" ] && [ $filename != "public/js/render.js" ] && [ $filename != "public/js/sw.js" ]; then
		cat $filename >> client-dist/js/bundle.js
	fi
done

cat public/js/render.js >> client-dist/js/bundle.js
cat public/js/main.js >> client-dist/js/bundle.js
cat public/js/sw.js > client-dist/js/sw.js

# css ----------------------------------
mkdir -p client-dist/css

cat public/css/main.css >> client-dist/css/bundle.css
cat public/css/index.css >> client-dist/css/bundle.css
cat public/css/not-found.css >> client-dist/css/bundle.css
cat public/css/settings.css >> client-dist/css/bundle.css
cat public/css/modal.css >> client-dist/css/bundle.css

# html & others ------------------------

cat public/index.html > client-dist/index.html
cat public/manifest.json > client-dist/manifest.json
cp -rf public/images client-dist/images

echo "Things to do:"
echo "1. Update the <link> and <script> tags in index.html"
echo "2. Enable service worker and set app version & files"
echo "3. Copy Google fonts into the css file"
echo "4. Remove elements inside of div#root and add them in js"
echo "5. Optimize View's constructor"
echo "6. Run JS through Babel for compatibility"
echo "7. Minify html, css, js"
