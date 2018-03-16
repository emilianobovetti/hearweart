empty :=
comma := ,
space := $(empty) $(empty)
# add assets/<node-asset> to .gitignore too
node-assets := $(addprefix assets/, purecss rellax lightgallery.js lg-thumbnail.js stateless-maybe-js)
surge := node node_modules/surge/lib/cli.js

define addslashes
	$(addprefix /,$(addsuffix /,$(1)))
endef

define space2comma
	$(subst $(space),$(comma),$(1))
endef

all : jekyll htmlproofer

.PHONY: deploy
deploy : all
	@$(surge) _site

.PHONY: yarn
yarn :
	@yarn

assets/% : node_modules/%
	@cp -r $< $@

.PHONY: assets
assets : yarn
	@make $(node-assets)

.PHONY: jekyll
jekyll : assets
	@bundle install --path vendor/bundle
	@bundle exec jekyll build

.PHONY: htmlproofer
htmlproofer :
	@bundle exec htmlproofer _site \
		--file-ignore $(call space2comma,$(call addslashes,$(node-assets))) \
		--disable-external \
		--assume-extension \
		--check-html

.PHONY: serve
serve : jekyll
	@bundle exec jekyll serve

.PHONY: thumb
thumb :
	@cd assets/gallery/2017 && \
		mogrify -path thumb -thumbnail 20% full/*

.PHONY: clean
clean :
	@rm -f yarn-error.log Gemfile.lock yarn.lock
	@rm -rf .jekyll-metadata .sass-cache .bundle
	@rm -rf node_modules vendor _site
	@rm -rf $(node-assets)