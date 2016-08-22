require 'rest-client'
require 'json'

# Thanks https://github.com/huzhenjie/Bus/blob/master/bus.py

module Gzbus
  class Wechat
    def initialize(openid_in_xingxingtong = 'ouz9MsyNIpeYEMJEhI7E-peH3oOk')
      @base_url = 'http://wxbus.gzyyjt.net/wei-bus-app'
      @headers = {
        'Cookie': "realOpenId=#{openid_in_xingxingtong}; openId=#{openid_in_xingxingtong}"
      }
    end

    # 附近线路
    # @return
    # [
    #     [  0] {
    #          "ri" => "469",
    #          "rn" => "8路",
    #         "rsi" => "81241",
    #           "d" => "0",
    #         "rsn" => "园艺场站"
    #     },
    #     [  1] {
    #          "ri" => "755",
    #          "rn" => "B7路",
    #         "rsi" => "127889",
    #           "d" => "0",
    #         "rsn" => "墩和站"
    #     }
    # ]
    def nearby_line(latitude, longitude)
      url = "#{@base_url}/route/getByLatitudeAndLongitude"
      query(url, :post, {latitude: latitude, longitude: longitude})
    end

    # 预计到站时间
    # @return 23
    def guess_arrive_time(busid, rsid) # eg busId:1933230 rsId:127891
      url = "#{@base_url}/arriveRemind/remindTime"
      res = ::RestClient::Request.execute(
        method: :post,
        url: url,
        timeout: 10,
        payload: {busId: busid, rsId: rsid},
        headers: @headers
      )
      res.body.to_i
    end

    # 附近车辆
    # @return [{"count":6,"time":9},{"count":-1,"time":-1},{"count":-1,"time":-1}]
    # -1表示没有, count表示还有几站, time表示等待分钟数
    def nearby_waittime(rsid, num = 3) # eg rsid=127889
      url = "#{@base_url}/waitBus/waitTime"
      query(url, :post, {rsId: rsid, num: num})
    end

    # 方向查询???
    # TODO
    # @return [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    def get_by_route_and_direction(line_number, direction = 0)
      url = "#{@base_url}/road/getByRouteAndDirection/#{line_number}/#{direction}"
      query(url)
    end


    # @return
    # [
    #     [0] {
    #         "i" => "755",
    #         "n" => "B7路"
    #     },
    #     [1] {
    #         "i" => "757",
    #         "n" => "B7快线"
    #     }
    # ]
    def search_line(line_name)
      url = "#{@base_url}/route/getByName"
      query(url, :post, {name: line_name})
    end

    # 站点查询
    # @return
    # [
    #     [ 0] {
    #         "i" => "2647",
    #         "n" => "康大职业技术学院站"
    #     },
    #     [ 1] {
    #         "i" => "4635",
    #         "n" => "科学院站"
    #     }
    #     ...
    # ]
    def search_station(station_name) # eg 学院站
      url = "#{@base_url}/station/getByName"
      query(url, :post, {name: station_name})
    end

    # @return
    # {
    #     "rn" => "B7路",
    #      "d" => "0",
    #      "c" => "80070",
    #     "ft" => "0600",
    #     "lt" => "2200",
    #      "l" => [
    #         [ 0] {
    #               "i" => "127863",
    #               "n" => "东圃客运站总站",
    #             "sni" => "10000675",
    #              "si" => "10002572"
    #         },
    #         [ 1] {
    #               "i" => "127864",
    #               "n" => "黄村站",
    #             "sni" => "10001472",
    #              "si" => "10005243"
    #         }
    #         ...
    #     ]
    # }
    def line(line_number, direction = 0) # eg 755 = B7路
      url = "#{@base_url}/routeStation/getByRouteAndDirection/#{line_number}/#{direction}"
      query(url)
    end

    # 站点线路
    # @return
    # {
    #     "n" => "康大职业技术学院站",
    #     "i" => 2647,
    #     "l" => [
    #         [0] {
    #              "ri" => "6110",
    #              "rn" => "345路",
    #             "rsi" => "311949",
    #               "d" => "0",
    #              "dn" => "天河客运站总站-九龙镇政府总站"
    #         },
    #         [1] {
    #              "ri" => "6110",
    #              "rn" => "345路",
    #             "rsi" => "311958",
    #               "d" => "1",
    #              "dn" => "九龙镇政府总站-天河客运站总站"
    #         }
    #     ]
    # }
    def station(station_number)
      url = "#{@base_url}/routeStation/getByStation/#{station_number}"
      query url
    end

    # 公交站的线路距离信息
    def station_line_dis_info(station_number)
      url = "#{@base_url}/runBus/getByStation/#{station_number}"
      query url
    end

    # 公交站的线路时间信息 -1表示未发车
    def station_line_time_info(station_number)
      url = "#{@base_url}/runBus/getTimeByStation/#{station_number}"
      query url
    end

    # "i" => "1933225",
    # "si" => "738646",
    # "t" => "1" 1:普通 2:短线 4:区(what?)
    # @return
    # [
    #     [ 0] {
    #          "bl" => [], 正到站
    #         "bbl" => [] 站牌之间
    #     },
    #     [ 1] {
    #          "bl" => [],
    #         "bbl" => [
    #             [0] {
    #                  "i" => "1933174",
    #                 "si" => "738646",
    #                  "t" => "1"
    #             }
    #         ]
    #     }
    #     ...
    # ]
    def realtime_bus_info(line_number, direction = 0)
      url = "#{@base_url}/runBus/getByRouteAndDirection/#{line_number}/#{direction}"
      query(url)
    end

    # @return
    # {
    #            "i" => "127867",
    #            "n" => "科韵路站",
    #          "lng" => "113.368896",
    #          "lat" => "23.128279",
    #     "distance" => "824"
    # }
    def nearby_bus_station(line_number, latitude = 23.13567985541953, longitude = 113.3691701575641, direction = 0)
      url = "#{@base_url}/routeStation/getNearStationByRoute/#{line_number}/#{direction}"
      query(url, :post, {latitude: latitude, longitude: longitude})
    end

    private

    def query(url, method = :get, payload = {})
      begin
        res = ::RestClient::Request.execute(
          method: method,
          url: url,
          timeout: 10,
          payload: payload,
          headers: @headers
        )
        if res.code == 200
          begin
            JSON.parse res.body
          rescue => ejson
            p ejson
            return nil
          end
        else
          nil
        end
      rescue => e
        p e
        return nil
      end
    end
  end
end
