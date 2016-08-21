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
      res = ::RestClient::Request.execute(
        method: :post,
        url: url,
        payload: {name: line_name},
        headers: @headers
      )
      if res.code == 200
        JSON.parse res.body
      else
        nil
      end
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
      res = ::RestClient::Request.execute(
        method: :get,
        url: url,
        timeout: 10,
        headers: @headers
      )
      if res.code == 200
        JSON.parse res.body
      else
        nil
      end
    end

    # "i" => "1933225",
    # "si" => "738646",
    # "t" => "1" 1:普通 2:短线 4:区(what?)
    # @return
    # [
    #     [ 0] {
    #          "bl" => [],
    #         "bbl" => []
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
      res = ::RestClient::Request.execute(
        method: :get,
        url: url,
        timeout: 10,
        headers: @headers
      )
      if res.code == 200
        JSON.parse res.body
      else
        nil
      end
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
      res = ::RestClient::Request.execute(
        method: :post,
        url: url,
        payload: {latitude: latitude, longitude: longitude},
        headers: @headers
      )
      if res.code == 200
        JSON.parse res.body
      else
        nil
      end
    end
  end
end
