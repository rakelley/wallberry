# wallberry.rb
require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)
require_relative 'lib/wallberry_base'
require_relative 'lib/wallberry_admin'

class Wallberry < Sinatra::Base
  register Sinatra::Partial
  register Sinatra::ConfigFile
  register Sinatra::WallberryBase
  register Sinatra::WallberryAdmin

  set :haml, :format => :html5, :ugly => true
  set :markdown, :layout_engine => :haml, :fenced_code_blocks => true
  enable :sessions

  @@configuration_file = 'wallberry.yaml'
  config_file @@configuration_file

  helpers do
    def get_config
      YAML.load_file @@configuration_file
    end

    def update_config(config)
      File.write(@@configuration_file, config.to_yaml)
    end
  end

end
