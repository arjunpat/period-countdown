# dist/client/js cannot exist! delete before running


# javascript ---------------------------
mkdir -p client-dist/js

for filename in public/js/*; do
	if [ $filename != "public/js/main.js" ] && [ $filename != "public/js/polyfills.js" ]; then
		cat $filename >> client-dist/js/bundle.js
	fi
done

cat public/js/main.js >> client-dist/js/bundle.js



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
echo "2. Copy Google fonts into the css file"
echo "3. Remove elements inside of div#root and add them in js"
echo "4. Run JS through Babel for compatibility"
echo "5. Minify html, css, js"