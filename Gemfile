source "https://rubygems.org"

# Jekyll版本
gem "jekyll", "~> 4.3.0"

# GitHub Pages支持
gem "github-pages", group: :jekyll_plugins

# Jekyll插件
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-paginate"
end

# Windows和JRuby不包含时区信息文件，所以我们需要这个gem
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 文件监控gem（提升Windows性能）
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# 允许在JRuby上使用kramdown
gem "kramdown-parser-gfm" if ENV["JEKYLL_VERSION"] == "~> 4.3.0"