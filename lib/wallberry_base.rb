require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

module Sinatra
  module WallberryBase

    module Helpers
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

      #converts value to nil if empty/false/nil but preserves 0
      def not_empty?(var)
        if (var.to_s == '' || var == false)
          return nil
        else
          return var
        end
      end

      def plaintext(var)
        var.gsub(/[^0-9A-Za-z]/, '_')
      end
    end


    def self.registered(app)
      app.helpers WallberryBase::Helpers

      app.get '/' do
        haml :index
      end

      app.get '/random' do
        file = random_background

        content_type :json
        { 'file' => file }.to_json
      end

      app.get '/exterior' do
        content_type :json
        get_exterior
      end

      app.get '/interior' do
        temp = get_interior

        content_type :json
        { 'temp' => temp }.to_json
      end
    end
  end

  register WallberryBase
end
