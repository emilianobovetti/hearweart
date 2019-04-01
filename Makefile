node_bin := node_modules/.bin

all : jekyll htmlproofer

node_bin :
	@yarn

node-assets : node_bin
	@node make-node-assets.js

.PHONY: jekyll
jekyll : node-assets
	@bundle install --path vendor/bundle
	@bundle exec jekyll build

.PHONY: htmlproofer
htmlproofer :
	@bundle exec htmlproofer _site \
		--file-ignore /node-assets/ \
		--disable-external \
		--assume-extension \
		--allow-hash-href \
		--check-html

.PHONY: serve
serve : jekyll
	@bundle exec jekyll serve

.PHONY: thumbs
thumbs :
	@mkdir -p assets/gallery/2017/thumb
	@cd assets/gallery/2017 && \
		mogrify -path thumb -thumbnail 30% -quality 90 full/*

.PHONY: clean
clean :
	@rm -f yarn-error.log Gemfile.lock
	@rm -rf .jekyll-metadata .sass-cache .bundle
	@rm -rf node_modules vendor _site
	@rm -rf node-assets
