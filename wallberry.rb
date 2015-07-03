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
    def random_background
      target = File.join('public', 'backgrounds')
      if (not_empty?(settings.backgrounds[:filter]))
        target = File.join(target, settings.backgrounds[:filter])
      end
      target = File.join(target, '**', '*.*')
      Dir.glob(target).sample.gsub("public#{File::SEPARATOR}", '')
    end

    #gets list of background subdirectories, adds empty string at 0 index
    def get_background_dirs
      target = File.join('public', 'backgrounds', '*', '')
      dirs = Dir.glob(target).map! { |dir| dir.split(File::SEPARATOR).last }
      dirs.unshift('')
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
      (session[:authed])
    end

    def set_authorized
      session[:authed] = true
    end

    def unset_authorized
      session[:authed] = false
    end

    def admin_disabled?
      (false == settings.admin[:permitted])
    end

    def login_success?
      (!admin_disabled? &&
      params[:username] == settings.admin[:username] &&
      params[:password] == settings.admin[:password])
    end

    def require_auth
      if (admin_disabled? || !authorized?)
        redirect '/admin', 401
      end
    end

    def get_config
      YAML.load_file @@configuration_file
    end

    def update_config(config)
      File.write(@@configuration_file, config.to_yaml)
    end

    #converts value to nil if empty/false/nil but preserves 0
    def not_empty?(var)
      if (var.to_s == '' || var == false)
        return nil
      else
        return var
      end
    end
  end

  def plaintext(var)
    var.gsub(/[^0-9A-Za-z]/, '_')
  end


  get '/' do
    haml :index
  end

  get '/random' do
    file = random_background

    content_type :json
    { 'file' => file }.to_json
  end

  put '/backgrounds/:dir' do
    require_auth

    dir = File.join('public', 'backgrounds', plaintext(params[:dir]))
    if (!Dir.exist?(dir))
      Dir.mkdir(dir)
    end

    content_type :json
    true.to_json
  end

  delete '/backgrounds/:dir' do
    require_auth

    dir = File.join('public', 'backgrounds', plaintext(params[:dir]))
    if (Dir.exist?(dir))
      Dir.glob(File.join(dir, '*')).each do |file|
        File.delete(file)
      end
      Dir.rmdir(dir)
    end

    content_type :json
    true.to_json
  end

  post '/backgrounds/filter' do
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
      @directories = get_background_dirs
      haml :admin
    elsif (admin_disabled?)
      markdown :noadmin
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
