# rakelley.rb
require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

class Wallberry < Sinatra::Base
  register Sinatra::Partial

  set :haml, :format => :html5, :ugly => true
  set :markdown, :layout_engine => :haml, :fenced_code_blocks => true

  helpers do
    def get_file(sub_dir=nil)
      target = File.join('public', 'backgrounds')
      if (sub_dir?)
        target = File.join(target, sub_dir)
      end
      target = File.join(target, '**', '*')

      Dir.glob(target).sample
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
end
