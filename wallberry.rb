# rakelley.rb
require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

class Wallberry < Sinatra::Base
  register Sinatra::Partial
  register Sinatra::ConfigFile

  set :haml, :format => :html5, :ugly => true
  set :markdown, :layout_engine => :haml, :fenced_code_blocks => true
  enable :sessions

  @@configuration_file = 'wallberry.yaml'
  config_file @@configuration_file

  helpers do
    def get_file
      target = File.join('public', 'backgrounds')
      if (not_empty?(settings.backgrounds[:filter]))
        target = File.join(target, settings.backgrounds[:filter])
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
      if (not_empty?(settings.interior[:id]))
        path = File.join('', 'sys', 'bus', 'w1', 'devices',
                         settings.interior[:id], 'w1_slave')
        temp = File.read(path).split('t=').last
        return temp.to_f / 1000
      else
        return nil
      end
    end

    def authorized?
      return (session[:authed])
    end

    def set_authorized
      session[:authed] = true
    end

    def unset_authorized
      session[:authed] = false
    end

    def login_success?
      return (params[:username] == settings.admin[:username] &&
              params[:password] == settings.admin[:password])
    end

    def require_auth
      if (!authorized?)
        redirect to('/admin'), 401
      end
    end

    def get_config
      YAML.load_file @@configuration_file
    end

    def update_config(config)
      File.write(@@configuration_file, config.to_yaml)
    end

    #converts variable to nil if empty/false/nil but preserves 0
    def not_empty?(var)
      if (var.to_s == '' || var == false)
        return nil
      else
        return var
      end
    end
  end


  get '/' do
    haml :index
  end

  get '/backgrounds' do
    file = get_file

    content_type :json
    { 'file' => file }.to_json
  end

  post '/backgrounds' do
    require_auth

    config = get_config
    config['backgrounds']['filter'] = not_empty?(params[:filter])
    settings.backgrounds[:filter] = not_empty?(params[:filter])
    update_config(config)
    redirect to('/admin')
  end

  get '/exterior' do
    content_type :json
    get_exterior
  end

  post '/exterior' do
    require_auth

    config = get_config
    config['exterior']['city'] = params[:city].to_i
    settings.exterior[:city] = params[:city].to_i
    config['exterior']['units'] = params[:units]
    settings.exterior[:units] = params[:units]
    update_config(config)
    redirect to('/admin')
  end

  get '/interior' do
    temp = get_interior

    content_type :json
    { 'temp' => temp }.to_json
  end

  post '/interior' do
    require_auth

    config = get_config
    config['interior']['id'] = not_empty?(params[:id])
    settings.interior[:id] = not_empty?(params[:id])
    update_config(config)
    redirect to('/admin')
  end

  get '/admin' do
    if (authorized?)
      haml :admin
    else
      haml :login
    end
  end

  post '/admin' do
    require_auth

    config = get_config
    config['admin']['username'] = params[:username]
    settings.admin[:username] = params[:username]
    config['admin']['password'] = params[:password]
    settings.admin[:password] = params[:password]
    update_config(config)
    redirect to('/logout')
  end

  post '/login' do
    if (login_success?)
      set_authorized
    end
    redirect to('/admin')
  end

  get '/logout' do
    unset_authorized
    redirect to('/admin')
  end
end
