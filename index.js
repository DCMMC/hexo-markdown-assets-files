'use strict';

var shell = require('shelljs');
var log = hexo.log || log.log;

hexo.extend.filter.register('before_post_render', function(postInfo) {
	// we need markdown_assets_conf in `_config.yml`
	// sometimes you should execute `hexo clean` to ensure trigger sucessfully.
	// Example:
	// ```yml
	// markdown_assets_conf:
	//   enable: true
	//   assets_dir: assets
	// ```
	// P.S. `assets` is a asset directory located at `/source/_posts/assets`
	var title = postInfo.title ? postInfo.title : "No Title";
	log.log('Start filter markdown assets for: ' + title);
	// validate config
	var markdownAssetsConfig = hexo.config.markdown_assets_conf;
	if (!markdownAssetsConfig || !markdownAssetsConfig.enable || !markdownAssetsConfig.assets_dir) {
		return;
	}
	var illegal_pattern = /\||<|>|\?|\*|:|\/|\\|"/;
	if (illegal_pattern.test(markdownAssetsConfig.assets_dir)) {
		log.error('assets_dir is illegal!');
		return;
	}
	
	var exists = false;
	shell.ls('./source/_posts').forEach((file) => {
		log.debug(file);
		if (file == markdownAssetsConfig.assets_dir) {
			exists = true;
		}
	});
	if (!exists) {
		log.error('assers_dir not exists!');
		return;
	}
	log.debug('found assets_dir');
	// generate asserts manually
	// TODO: more flexible
	shell.cp('-Rf', './source/_posts/assets', './public/')
  // handle (inner most) markdown link and markdown image
	var re_pattern = "\\[([^\\[]*?)\\]\\(((\\.\\/)|(\\.\\\\\))?(" + markdownAssetsConfig.assets_dir + 
		"([\\/\\\\\]+[^\\(\\[]*?)*?)\\)";
	var re_pattern_assets = new RegExp(re_pattern, "gm");
	postInfo.content = postInfo.content.replace(re_pattern_assets, '[$1](/$5)');
	if (postInfo.img) {
		var re_img = "((\\.\\/)|(\\.\\\\))?(" + markdownAssetsConfig.assets_dir +
			"([\\/\\]+[^\\(\\[]*?)*?)";
		var re_img_pattern = new RegExp(re_img);
		postInfo.img = postInfo.img.replace(re_img_pattern, '/$4');
	}
	log.log('Finished filter markdown assets.')
});
