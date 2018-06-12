empty :=
comma := ,
space := $(empty) $(empty)
surge := node node_modules/surge/lib/cli.js
make-node-assets := node make-node-assets.js

all : jekyll htmlproofer

.PHONY: deploy
deploy : all
	@$(surge) _site

.PHONY: yarn-check
yarn-check :
ifeq ("$(wildcard node_modules/.bin)", "")
	@yarn
endif

node-assets : yarn-check
	@$(make-node-assets)

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
	@rm -f yarn-error.log Gemfile.lock yarn.lock
	@rm -rf .jekyll-metadata .sass-cache .bundle
	@rm -rf node_modules vendor _site
	@rm -rf node-assets
