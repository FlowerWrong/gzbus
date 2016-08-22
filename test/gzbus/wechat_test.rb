require 'test_helper'

class WechatTest < Minitest::Test
  def setup
    @gz = ::Gzbus::Wechat.new()
  end

  # What?
  # TODO
  def test_wrong_openid
    @gz_wrong = ::Gzbus::Wechat.new(1)
    line_info = @gz_wrong.line(755)
    ap line_info
    refute_nil line_info
  end

  def test_wrong_line
    line_info = @gz.line(1)
    ap line_info
    assert line_info.nil?
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

  def test_get_by_route_and_direction
    get_by_route_and_direction = @gz.get_by_route_and_direction(755)
    ap get_by_route_and_direction
    refute_nil get_by_route_and_direction
  end

  def test_nearby_waittime
    nearby_waittime = @gz.nearby_waittime(127889)
    ap nearby_waittime
    refute_nil nearby_waittime
  end

  def test_guess_arrive_time
    guess_arrive_time = @gz.guess_arrive_time(1933230, 127891)
    ap guess_arrive_time
    refute_nil guess_arrive_time
  end

  def test_nearby_line
    nearby_line = @gz.nearby_line(23.092232496898042, 113.30935028842292)
    ap nearby_line
    refute_nil nearby_line
  end

  def test_search_station
    search_station = @gz.search_station('学院站')
    ap search_station
    refute_nil search_station
  end

  def test_station
    station = @gz.station(2647)
    ap station
    refute_nil station
  end

  def test_station_line_dis_info
    station_line_dis_info = @gz.station_line_dis_info(2647)
    ap station_line_dis_info
    refute_nil station_line_dis_info
  end

  def test_station_line_time_info
    station_line_time_info = @gz.station_line_time_info(2647)
    ap station_line_time_info
    refute_nil station_line_time_info
  end
end
