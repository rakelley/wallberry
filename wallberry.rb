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
    def get_file
      sub_dir = settings.backgrounds[:sub_dir] || nil
      target = File.join('public', 'backgrounds')
      if (sub_dir)
        target = File.join(target, sub_dir)
      end
      target = File.join(target, '**', '*.*')
      Dir.glob(target).sample.gsub("public#{File::SEPARATOR}", '')
    end

    def get_exterior
      id = settings.exterior[:city]
      units = settings.exterior[:units]
      url = "http://api.openweathermap.org/data/2.5/weather?id=#{id}&units=#{units}"

      begin
        request = Curl.get(url)
        request.body_str
      rescue
        {}.to_json
      end
    end

    def get_interior
      if (settings.interior[:id])
        path = File.join('', 'sys', 'bus', 'w1', 'devices',
                         settings.interior[:id], 'w1_slave')
        temp = File.read(path).split('t=').last
        return temp.to_f / 1000
      else
        return nil
      end
    end
  end

  get '/' do
    haml :index
  end

  get '/next' do
    file = get_file

    content_type :json
    { 'file' => file }.to_json
  end

  get '/exterior' do
    content_type :json
    get_exterior
  end

  get '/interior' do
    temp = get_interior

    content_type :json
    { 'temp' => temp }.to_json
  end
end
