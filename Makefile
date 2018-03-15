empty :=
comma := ,
space := $(empty) $(empty)
# add assets/<node-asset> to .gitignore too
node-assets := $(addprefix assets/, purecss rellax photoswipe)
surge := node node_modules/surge/lib/cli.js

.PHONY: deploy yarn assets jekyll htmlproofer serve clean

define addslashes
	$(addprefix /,$(addsuffix /,$(1)))
endef

define space2comma
	$(subst $(space),$(comma),$(1))
endef

all : jekyll htmlproofer

deploy : all
	@$(surge) _site

yarn :
	@yarn

assets/% : node_modules/%
	@cp -r $< $@

assets : yarn
	@make $(node-assets)

jekyll : assets
	@bundle install --path vendor/bundle
	@bundle exec jekyll build

htmlproofer :
	bundle exec htmlproofer _site \
		--file-ignore $(call space2comma,$(call addslashes,$(node-assets))) \
		--disable-external \
		--assume-extension \
		--check-html

serve : jekyll
	@bundle exec jekyll serve

clean :
	@rm -f yarn-error.log Gemfile.lock yarn.lock
	@rm -rf .jekyll-metadata .sass-cache .bundle
	@rm -rf node_modules vendor _site
	@rm -rf $(node-assets)