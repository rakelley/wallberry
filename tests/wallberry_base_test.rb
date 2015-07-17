ENV['RACK_ENV'] = 'test'

require 'rubygems'
require 'bundler/setup'
Bundler.require(:default, :test)
require_relative '../wallberry'

class WallberryBaseTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def app
    Wallberry
  end

  def test_get_index
    get '/'
    assert last_response.ok?
  end

  def test_get_random
    get '/random'
    assert last_response.ok?
    assert_nothing_raised do
      assert_not_nil(JSON.parse(last_response.body)['file'])
    end
  end

  def test_get_exterior
    get '/exterior'
    assert last_response.ok?
    assert_nothing_raised do
      JSON.parse(last_response.body)
    end
  end

  def test_get_interior
    get '/interior'
    assert last_response.ok?
    assert_nothing_raised do
      JSON.parse(last_response.body)
    end
  end
end
