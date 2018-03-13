# add assets/<node-asset> to .gitignore too
node-assets := $(addprefix assets/, purecss rellax)
surge := node node_modules/surge/lib/cli.js

.PHONY: deploy yarn assets jekyll htmlproofer serve clean

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
	@bundle exec htmlproofer _site --disable-external --assume-extension

serve : jekyll
	@bundle exec jekyll serve

clean :
	@rm -f yarn-error.log Gemfile.lock yarn.lock
	@rm -rf .jekyll-metadata .sass-cache .bundle
	@rm -rf node_modules vendor _site
	@rm -rf $(node-assets)