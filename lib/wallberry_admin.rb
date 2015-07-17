require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

module Sinatra
  module WallberryAdmin

    module Helpers
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
    end


    def self.registered(app)
      app.helpers WallberryAdmin::Helpers

      app.put '/backgrounds/:dir' do
        require_auth

        dir = File.join('public', 'backgrounds', plaintext(params[:dir]))
        if (!Dir.exist?(dir))
          Dir.mkdir(dir)
        end

        content_type :json
        true.to_json
      end

      app.delete '/backgrounds/:dir' do
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

      app.post '/backgrounds/filter' do
        require_auth

        config = get_config
        config['backgrounds']['filter'] = empty_to_nil(params[:filter])
        settings.backgrounds[:filter] = empty_to_nil(params[:filter])
        update_config(config)

        redirect to('/admin')
      end

      app.post '/exterior' do
        require_auth

        config = get_config
        config['exterior']['city'] = params[:city].to_i
        settings.exterior[:city] = params[:city].to_i
        config['exterior']['units'] = params[:units]
        settings.exterior[:units] = params[:units]
        update_config(config)

        redirect to('/admin')
      end

      app.post '/interior' do
        require_auth

        config = get_config
        config['interior']['id'] = empty_to_nil(params[:id])
        settings.interior[:id] = empty_to_nil(params[:id])
        update_config(config)

        redirect to('/admin')
      end

      app.get '/admin' do
        if (admin_disabled?)
          markdown :noadmin
        elsif (authorized?)
          @directories = get_background_dirs
          haml :admin
        else
          haml :login
        end
      end

      app.post '/admin' do
        require_auth

        config = get_config
        config['admin']['username'] = params[:username]
        settings.admin[:username] = params[:username]
        config['admin']['password'] = params[:password]
        settings.admin[:password] = params[:password]
        update_config(config)

        redirect to('/logout')
      end

      app.post '/login' do
        if (login_success?)
          set_authorized
        end

        redirect to('/admin')
      end

      app.get '/logout' do
        unset_authorized

        redirect to('/admin')
      end
    end
  end

  register WallberryAdmin
end
