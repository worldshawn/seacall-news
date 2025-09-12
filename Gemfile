source "https://rubygems.org"

# GitHub Pages支持的Jekyll版本
gem "github-pages", group: :jekyll_plugins

# Jekyll插件
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-paginate"
  gem "jekyll-gist"
  gem "jekyll-github-metadata"
  gem "jekyll-relative-links"
  gem "jekyll-optional-front-matter"
  gem "jekyll-readme-index"
  gem "jekyll-default-layout"
  gem "jekyll-titles-from-headings"
end

# Windows和JRuby不包含zoneinfo文件，需要使用tzinfo-data gem
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 性能增强器，用于监控目录变更
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# JRuby的HTTP客户端
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Webrick for Jekyll 4.0+
gem "webrick", "~> 1.7"