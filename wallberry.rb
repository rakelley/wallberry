# rakelley.rb
require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

class Wallberry < Sinatra::Base
  register Sinatra::Partial
  register Sinatra::ConfigFile

  config_file 'wallberry.yaml' 

  set :haml, :format => :html5, :ugly => true
  set :markdown, :layout_engine => :haml, :fenced_code_blocks => true

  helpers do
    def get_file(sub_dir=nil)
      target = File.join('public', 'backgrounds')
      if (sub_dir)
        target = File.join(target, sub_dir)
      end
      target = File.join(target, '**', '*')

      Dir.glob(target).sample.gsub("public#{File::SEPARATOR}", '')
    end
  end

  get '/' do
    haml :index
  end

  get '/next' do
    sub_dir = settings.backgrounds[:sub_dir] || nil
    file = get_file(sub_dir)
    content_type :json
    { 'file' => file }.to_json
  end

  get '/exterior' do
    id = settings.weather[:city]
    units = settings.weather[:units]
    url = "http://api.openweathermap.org/data/2.5/weather?id=#{id}&units=#{units}"
    request = Curl.get(url)
    request.body_str
  end
end
