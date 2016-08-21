require 'test_helper'

class WechatTest < Minitest::Test
  def setup
    @gz = ::Gzbus::Wechat.new()
  end

  def test_query_line_by_name
    line_arr = @gz.search_line('B7')
    ap line_arr
    refute_nil line_arr
  end

  def test_get_line_info
    line_info = @gz.line(755)
    ap line_info
    refute_nil line_info
  end

  def test_nearby_bus_station
    nearby_bus_station = @gz.nearby_bus_station(755)
    ap nearby_bus_station
    refute_nil nearby_bus_station
  end

  def test_realtime_bus_info
    realtime_bus_info = @gz.realtime_bus_info(755)
    ap realtime_bus_info
    refute_nil realtime_bus_info
  end
end
