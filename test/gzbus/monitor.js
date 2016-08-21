var route_page = $("#route_monitor_page");
var route_header_title = route_page.find("#header_title");
var info_btn = route_page.find("div:jqmData(role='header') button:jqmData(icon='bars')");
var route_listview = route_page.find("div:jqmData(role='content') table");
var gotostation_listview = route_page.find("#gotostation_popup ul:jqmData(role='listview')");
var gotostation_service_name = route_page.find("#gotostation_popup p.service_name");
var route_home_btn = route_page.find("div:jqmData(role='footer') a:jqmData(icon='home')");
var route_direction_btn = route_page.find("div:jqmData(role='footer') a:jqmData(icon='back')");
var route_refresh_btn = route_page.find("div:jqmData(role='footer') a:jqmData(icon='refresh')");
var route_help_btn = route_page.find("div:jqmData(role='footer') a:jqmData(icon='alert')");
var gotostation_popup = route_page.find("#gotostation_popup");
var bus_operation_popup = route_page.find("#bus_operation_popup");
var route_info_popup = route_page.find("#route_info_popup");
var info_popup = route_page.find("#info_popup");
var info_listview = info_popup.find("ul:jqmData(role='listview')");
var waitbus_popup = route_page.find("#waitbus_popup");
var waitbus_select = waitbus_popup.find("select");
var timer_popup = route_page.find("#timer_popup");
var timer_btn = route_page.find("#timer_btn");
var message_div = route_page.find("#new_message_div");
var message_btn = message_div.find("a.new_message");
var route_page_bus_id = null;
var waitbus_options = null;
var mobilemsg = false;
var mode_value = null;
var days_value = null;
var time_value = null;
var history_flag = true;
var operation_num = 0;
var position_rsi = null;
$(function() {
    if (!common.getModuleRole("候车到站提醒", sessionStorage.openId) && !common.getModuleRole("用户交互", sessionStorage.openId)) {
        $("div:jqmData(role='footer') .btn4").hide();
        $("div:jqmData(role='footer') .btn3").show()
    }
    $(window).resize(function() {
        if ($(".runbus_info").width() >= 215) {
            $(".runbus_info").css("font-size", "1em")
        } else {
            $(".runbus_info").css("font-size", "4vw")
        }
    });
    route_monitor_listview(route_id, route_direction);
    waitbus_popup.find(".ui-block-a,.ui-block-c").height(waitbus_popup.find(".ui-block-b").height()).css("line-height", waitbus_popup.find(".ui-block-b").height() + "px");
    operation_popup.bind({
        popupafterclose: function(event, ui) {
            route_help_btn.removeClass("ui-btn-active")
        }
    }).find("ul a").each(function(i) {
        if (i == 0) {
            $(this).text("线路评价").unbind().click(function() {
                operation_popup.popup("close");
                checkUserPhone("route/assess/" + route_id + "/" + route_direction)
            })
        } else if (i == 1) {
            $(this).text("线路反馈").unbind().click(function() {
                operation_popup.popup("close");
                checkUserPhone("route/complain/" + route_id + "/" + route_direction)
            })
        } else if (i == 2) {
            $(this).text("纠错意见").unbind().click(function() {
                operation_popup.popup("close");
                checkUserPhone(feedback_reset)
            })
        } else if (i == 3) {
            $(this).text("帮助").unbind().click(function() {
                location.href = "route/demo/" + route_id + "/" + route_direction
            })
        } else {
            $(this).parent().hide()
        }
    });
    $("#runbus_cg_btn").click(function(data) {
        gotostation_listview.find("li").show();
        gotostation_listview.find("li:first,li:last").hide();
        gotostation_popup.find("h3").html("候车站点设置");
        gotostation_popup.find("p:first").html("请选择站点获取候车信息");
        operation_num = 2;
        gotostation_popup.find(".service_name").hide();
        gotostation_popup.popup("open")
    })
});
var route_time = 29;
var route_timedsq = null;

function station_changeMode(v) {
    if (v == 0) {
        if (!$("#manual_btn").hasClass("ui-btn-active")) {
            $("#manual_btn").addClass("ui-btn-active");
            $("#auto_btn").removeClass("ui-btn-active");
            route_refresh_btn.find("font").text("刷新");
            clearInterval(route_timedsq);
            route_time = 29
        }
    } else {
        if (!$("#auto_btn").hasClass("ui-btn-active")) {
            $("#auto_btn").addClass("ui-btn-active");
            $("#manual_btn").removeClass("ui-btn-active");
            route_refresh_btn.find("font").text(30);
            route_timedsq = setInterval("route_refreshTime()", 1000)
        }
    }
}

function route_refreshTime() {
    route_refresh_btn.find("font").text(route_time);
    if (route_time == 0) {
        route_time = 30;
        route_refresh_btn.click()
    }
    route_time--
}

function bus_operation(id, num, routesubId) {
    if (!sessionStorage.runBusDate || new Date().getTime() - sessionStorage.runBusDate > 60000) {
        route_refresh_btn.click()
    }
    if (!common.getModuleRole("预测时间", sessionStorage.openId) && !common.getModuleRole("用户交互", sessionStorage.openId)) {
        gotostation(id, num, routesubId);
        return
    }
    if (!common.getModuleRole("候车到站提醒", sessionStorage.openId) && !common.getModuleRole("用户交互", sessionStorage.openId)) {
        route_page_bus_id = id.split("_")[0];
        operation_num = 1;
        getroutesubstation(num, routesubId, 1);
        return
    }
    bus_operation_popup.find("ul li").show();
    bus_operation_popup.find("ul a").each(function(i) {
        if (i == 0 && common.getModuleRole("候车到站提醒", sessionStorage.openId)) {
            $(this).text("到站提醒").unbind().click(function() {
                bus_operation_popup.popup("close");
                gotostation(id, num, routesubId)
            })
        } else if (i == 1 && common.getModuleRole("预测时间", sessionStorage.openId)) {
            $(this).text("到站时间预测").unbind().click(function() {
                bus_operation_popup.popup("close");
                route_page_bus_id = id.split("_")[0];
                operation_num = 1;
                getroutesubstation(num, routesubId, 0)
            })
        } else if (i == 2 && common.getModuleRole("用户交互", sessionStorage.openId)) {
            $(this).text("车辆评价").unbind().click(function() {
                bus_operation_popup.popup("close");
                if (id.indexOf("_") > 0) {
                    alert_popup.html("<p>你选择的车辆数大于一辆,请稍后在进行评价</p>").popup("open");
                    return
                }
                checkUserPhone("route/busassess/" + route_id + "/" + route_direction + "/" + id)
            })
        } else if (i == 3 && common.getModuleRole("用户交互", sessionStorage.openId)) {
            $(this).text("车辆反馈").unbind().click(function() {
                bus_operation_popup.popup("close");
                if (id.indexOf("_") > 0) {
                    alert_popup.html("<p>你选择的车辆数大于一辆,请稍后在进行反馈</p>").popup("open");
                    return
                }
                checkUserPhone("route/buscomplain/" + route_id + "/" + route_direction + "/" + id)
            })
        } else if (i == 4 && common.getModuleRole("用户交互", sessionStorage.openId)) {
            $(this).text("司机反馈").unbind().click(function() {
                bus_operation_popup.popup("close");
                if (id.indexOf("_") > 0) {
                    alert_popup.html("<p>你选择的车辆数大于一辆,请稍后在进行反馈</p>").popup("open");
                    return
                }
                checkUserPhone("route/drivercomplain/" + route_id + "/" + route_direction + "/" + id)
            })
        } else {
            $(this).parent().hide()
        }
    });
    bus_operation_popup.popup("open")
}

function gotostation(id, num, routesubId) {
    if (!common.getModuleRole("候车到站提醒", sessionStorage.openId)) {
        return
    }
    operation_num = 0;
    gotostationcheckcount(id, num, routesubId)
}

function gotostationcheckcount(id, num, routesubId) {
    if (id.indexOf("_") > 0) {
        confirm_popup.find("h3").html("车辆重叠提醒");
        confirm_popup.find("p").html("你选择的车辆数大于一辆,现在设置可能会造成提醒误差,确定继续设置到站提醒吗?");
        confirm_popup.find("a").removeClass("ui-btn-active");
        confirm_popup.find("a:first").unbind().on("click", function() {
            confirm_popup.popup("close");
            route_page_bus_id = id.split("_")[0];
            gotostationchecktimes(num, routesubId)
        });
        confirm_popup.find("a:last").unbind().on("click", function() {
            confirm_popup.popup("close")
        });
        confirm_popup.popup("open")
    } else {
        route_page_bus_id = id;
        gotostationchecktimes(num, routesubId)
    }
}

function gotostationchecktimes(num, routesubId) {
    mobilemsg = false;
    gotostationover(num, routesubId)
}

function gotostationover(num, routesubId) {
    if (num + 2 >= gotostation_listview.find("li").length) {
        alert_popup.html("<p>此车即将到达终点站,不可再设置到站提醒</p>").popup("open");
        return
    }
    if (common.getModuleRole("新线路简图", sessionStorage.openId)) {
        getroutesubstation(num, routesubId, 1)
    } else {
        gotostationshow(num)
    }
}

function getroutesubstation(num, routesubId, flag) {
    if (!common.getModuleRole("预测时间", sessionStorage.openId)) {
        return
    }
    var routeSubArray = null;
    if (sessionStorage.routeSub) {
        routeSubArray = JSON.parse(sessionStorage.routeSub);
        for (var i in routeSubArray) {
            if (routeSubArray[i].i == routesubId) {
                routesubstationshow(num, routeSubArray[i], flag);
                return
            }
        }
    } else {
        routeSubArray = new Array()
    }
    $.getJSON("routeSubStation/getByRouteSub/" + routesubId, function(data) {
        data.i = routesubId;
        routeSubArray.push(data);
        sessionStorage.routeSub = JSON.stringify(routeSubArray);
        routesubstationshow(num, data, flag)
    })
}

function routesubstationshow(num, data, flag) {
    if (data.n == "全程") {
        gotostation_popup.find(".service_name").html(data.n).hide()
    } else {
        gotostation_popup.find(".service_name").html(data.n).show()
    }
    var curStationId = gotostation_listview.find("li:eq(" + num + ")").attr("stationId");
    gotostation_listview.find("li").hide();
    var temp = -999;
    for (var i = 0; i < data.l.length; i++) {
        if (temp > 0) {
            gotostation_listview.find("li[stationId='" + data.l[i].i + "']").show()
        }
        temp++;
        if (curStationId == data.l[i].i) {
            temp = 0
        }
    }
    if (gotostation_listview.find("li:visible").length < 1) {
        if (data.l.length > 0) {
            alert_popup.html("<p>此车即将到达终点站<font color='red'>" + data.l[data.l.length - 1].n + "</font>,不可再进行相应操作</p>").popup("open")
        } else {
            gotostationshow(num)
        }
        return
    }
    if (flag) {
        gotostation_popup.find("h3").html("到站提醒设置");
        gotostation_popup.find("p:first").html("请选择下列站点设置到站提醒")
    } else {
        gotostation_popup.find("h3").html("到站时间预测");
        gotostation_popup.find("p:first").html("请选择下列站点预测到站时间")
    }
    gotostation_popup.popup("open")
}

function gotostationshow(num) {
    gotostation_listview.find("li").show();
    gotostation_listview.find("li:lt(" + (num + 2) + ")").hide();
    gotostation_popup.find("h3").html("到站提醒设置");
    gotostation_popup.find("p:first").html("请选择下列站点设置到站提醒");
    gotostation_popup.popup("open")
}

function gotostationalert(rsId, rsName) {
    gotostation_popup.popup("close");
    if (operation_num == 1) {
        $.post("arriveRemind/remindTime", {
            busId: route_page_bus_id,
            rsId: rsId
        }, function(data) {
            var alertmsg = "<p>此车预计将在<span style='color: rgb(255,104,5);font-size: 1.5em;'>" + data + "</span>分钟后到达<span style='color: rgb(255,104,5);'>" + rsName + "</span></p><p style='text-align:center;'>（预测数据，仅供参考）</p>";
            if (data == "0") {
                alertmsg = "<p>此车已经到达" + rsName + "</p><p style='text-align:center;'>（预测数据，仅供参考）</p>"
            } else if (data == "-2") {
                alertmsg = "<p>未收集到进站数据,请稍后再试!</p>"
            }
            alert_popup.html(alertmsg).popup("open")
        })
    } else if (operation_num == 2) {
        if (position_rsi != rsId) {
            $(".tbl_item img[data-rsi='" + position_rsi + "']").attr("src", "images/clock.png");
            position_rsi = rsId;
            $(".tbl_item img[data-rsi='" + position_rsi + "']").attr("src", "images/people.png")
        }
        setTimeout('scroll(0,' + ($(".tbl_item img[data-rsi='" + position_rsi + "']").offset().top - ($(window).height() - route_header_title.height() - route_page.find("div:jqmData(role='footer')").height()) / 2 - 18) + ')', 1);
        route_refresh_btn.click()
    } else {
        $.get("user/checkUserOnLine", function(data) {
            if (eval(data)) {
                $.post("arriveRemind/addRemind", {
                    busId: route_page_bus_id,
                    rsId: rsId
                }, function(data) {
                    var alertmsg = "<p>设置到站提醒成功,系统将在车辆到达" + rsName + "通过微信进行提醒,请留意微信公众号的消息</p>";
                    if (mobilemsg) {
                        alertmsg = "<p>设置到站提醒成功,系统将在车辆到达" + rsName + "通过短信进行提醒,请留意手机短信</p>"
                    }
                    alert_popup.html(alertmsg).popup("open")
                })
            } else {
                location.href = "remindError"
            }
        })
    }
}

function waitbus(rsId, rsName, rName, dn, num) {
    if (!common.getModuleRole("候车到站提醒", sessionStorage.openId)) {
        return
    }
    if (!sessionStorage.runBusDate || new Date().getTime() - sessionStorage.runBusDate > 60000) {
        route_refresh_btn.click()
    }
    waitbusshow(rsId, rsName, rName, dn, num)
}

function waitbusshow(rsId, rsName, rName, dn, num) {
    mobilemsg = false;
    waitbussend(rsId, rsName, rName, dn, num)
}

function waitbussend(rsId, rsName, rName, dn, num) {
    waitbus_popup.find("h3").html("候车提醒设置");
    waitbus_popup.find(".curStation").html("站点：" + rsName);
    if (common.getModuleRole("预测时间", sessionStorage.openId)) {
        waitbus_popup.find("p.waitTime").html("");
        $.post("waitBus/waitTime", {
            rsId: rsId,
            num: "1"
        }, function(data) {
            data = data[0].time;
            var text = "";
            if (data == "-1") {
                text += "车辆　<span style='color: rgb(255,104,5);'>尚未发车</span>"
            } else if (data == "0") {
                text += "车辆　<span style='color: rgb(255,104,5);'>已进站</span>"
            } else if (data != "-2") {
                text += "车辆预计剩余<span style='color: rgb(255,104,5);font-size: 1.5em;'>" + data + "</span>分钟到达"
            }
            text += "<br>（预测数据，仅供参考）";
            waitbus_popup.find("p.waitTime").html(text)
        }, "json")
    }
    if (!common.getModuleRole("定时候车提醒", sessionStorage.openId)) {
        $("#timerwaitbus").hide()
    }
    waitbus_select.html("");
    for (var i = 0; i < num; i++) {
        waitbus_select.append("<option selected=true value='" + (num - i) + "_" + waitbus_options[i] + "'>" + waitbus_options[i].split("_")[1] + "</option>")
    }
    waitbus_popup.find("a").removeClass("ui-btn-active");
    waitbus_popup.find("#immediate").addClass("ui-btn-active");
    var date = new Date();
    if (date.getMinutes() < 30) {
        date.setMinutes(30, 0, 0)
    } else {
        date.setHours(date.getHours() + 1, 0, 0, 0)
    }
    mode_value = 1;
    days_value = "-1";
    time_value = (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" + (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes());
    timer_btn.attr("disabled", true).text(time_value + "提醒 仅一次");
    waitbus_popup.find("div[data-role='navbar'] a:first").unbind().on("click", function() {
        var remindNum = waitbus_select.val().split("_")[0];
        waitbus_popup.popup("close");
        $.get("user/checkUserOnLine", function(data) {
            if (eval(data)) {
                if (mode_value) {
                    $.post("waitBus/addRemind", {
                        rsId: rsId,
                        num: remindNum
                    }, function(data) {
                        var alertmsg = "<p>设置候车提醒成功,系统将在车辆到达" + waitbus_select.val().split("_")[2] + "通过微信进行提醒,请留意微信公众号的消息</p>";
                        if (mobilemsg) {
                            alertmsg = "<p>设置候车提醒成功,系统将在车辆到达" + waitbus_select.val().split("_")[2] + "通过短信进行提醒,请留意手机短信</p>"
                        }
                        alert_popup.html(alertmsg).popup("open")
                    })
                } else {
                    var times = time_value.split(":");
                    $.post("time/addRemind", {
                        rsId: rsId,
                        num: remindNum,
                        hour: times[0],
                        minute: times[1],
                        days: days_value
                    }, function(data) {
                        var alertmsg = "<p>设置定时候车提醒成功,系统将在指定时间后第一辆车到达" + waitbus_select.val().split("_")[2] + "通过微信进行提醒,请留意微信公众号</p>";
                        if (data == "2") {
                            alertmsg = "<p>设置定时候车提醒失败,已有重复的候车提醒设置</p>"
                        }
                        alert_popup.html(alertmsg).popup("open")
                    })
                }
            } else {
                location.href = "remindError"
            }
        })
    });
    waitbus_popup.popup("open")
}

function route_monitor_listview(id, direction) {
    var sessionIndex = null;
    if (sessionStorage.routeDataList) sessionIndex = sessionStorage.routeDataList.indexOf(id + "_" + direction);
    if (sessionIndex == null || sessionIndex < 0) {
        $.getJSON("routeStation/getByRouteAndDirection/" + id + "/" + direction, function(route) {
            if (sessionStorage.routeDataArray) {
                var index = sessionStorage.routeDataArray.indexOf(id + "_" + direction);
                if (index < 0) {
                    sessionStorage.routeDataArray = id + "_" + direction + "_" + JSON.stringify(route) + "|" + sessionStorage.routeDataArray
                } else {
                    var newIndex = sessionStorage.routeDataArray.indexOf("|", index);
                    sessionStorage.routeDataArray = id + "_" + direction + "_" + JSON.stringify(route) + (index == 0 ? "" : "|" + sessionStorage.routeDataArray.substring(0, index - 1)) + (newIndex >= 0 ? sessionStorage.routeDataArray.substring(newIndex) : "")
                }
            } else {
                sessionStorage.routeDataArray = id + "_" + direction + "_" + JSON.stringify(route)
            }
            if (sessionStorage.routeDataList) {
                sessionStorage.routeDataList = id + "_" + direction + "|" + sessionStorage.routeDataList
            } else {
                sessionStorage.routeDataList = id + "_" + direction
            }
            route_monitor_listview_refresh(id, direction, route)
        })
    } else {
        var route = null;
        var routeDataList = sessionStorage.routeDataArray.split("|");
        for (var i = 0; i < routeDataList.length; i++) {
            var temp = routeDataList[i].split("_");
            if (temp[0] == id && temp[1] == direction) {
                route = JSON.parse(temp[2]);
                break
            }
        }
        if (route) {
            route_monitor_listview_refresh(id, direction, route)
        } else {
            sessionStorage.removeItem("routeDataList");
            route_monitor_listview(id, direction)
        }
    }
}

function route_monitor_listview_refresh(id, direction, route) {
    route_listview.html("");
    if (common.getModuleRole("候车到站提醒", sessionStorage.openId)) {
        route_header_title.html("<U>" + route.rn + "</U>").click(function() {
            route_info_popup.find(".begin").html("起点站：" + route.l[0].n);
            route_info_popup.find(".end").html("终点站：" + route.l[route.l.length - 1].n);
            if (route.ft && route.lt && route.ft.length == 4 && route.lt.length == 4) {
                var ft = route.ft.charAt(0) + route.ft.charAt(1) + ":" + route.ft.charAt(2) + route.ft.charAt(3);
                var lt = route.lt.charAt(0) + route.lt.charAt(1) + ":" + route.lt.charAt(2) + route.lt.charAt(3);
                route_info_popup.find(".time").html("营运时间：" + ft + "-" + lt)
            } else {
                route_info_popup.find(".time").html("")
            }
            route_info_popup.popup("open")
        })
    } else {
        route_header_title.html(route.rn);
        info_btn.unbind().click(function() {
            route_info_popup.find(".begin").html("起点站：" + route.l[0].n);
            route_info_popup.find(".end").html("终点站：" + route.l[route.l.length - 1].n);
            if (route.ft && route.lt && route.ft.length == 4 && route.lt.length == 4) {
                var ft = route.ft.charAt(0) + route.ft.charAt(1) + ":" + route.ft.charAt(2) + route.ft.charAt(3);
                var lt = route.lt.charAt(0) + route.lt.charAt(1) + ":" + route.lt.charAt(2) + route.lt.charAt(3);
                route_info_popup.find(".time").html("营运时间：" + ft + "-" + lt)
            } else {
                route_info_popup.find(".time").html("")
            }
            route_info_popup.popup("open")
        })
    }
    if (route.l.length == 0) {
        var item = "<div style='text-align:center;height:200px;line-height:200px;font-size:20px'>此线路没有站点</div>";
        route_listview.append(item);
        setTimeout('route_direction_btn.removeClass("ui-btn-active");', 10);
        return
    }
    var firstLastName = route.l[0].n + "-" + route.l[route.l.length - 1].n;
    gotostation_listview.html("");
    waitbus_options = new Array();
    for (var i = 0; i < route.l.length; i++) {
        if (i == Math.floor(route.l.length / 2)) {
            position_rsi = route.l[i].i
        }
        var item = "<tr class='tbl_item'><td style='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' onclick='javascript:location.href=\"station/monitor/" + route.l[i].sni + "\"'>" + route.l[i].n + "</td><td><div style='width: 3em; height: 3em; overflow: hidden;'>";
        item += "<img data-rsi='" + route.l[i].i + "' style='width: 100%; height: 100%; overflow: hidden;' " + (i > 0 && i < route.l.length - 1 ? "onclick='waitbus(" + route.l[i].i + ",\"" + route.l[i].n + "\",\"" + route.rn + "\",\"" + firstLastName + "\"," + i + ")'" : "") + " src='images/" + (i == 0 ? "start" : (i == route.l.length - 1 ? "end" : "clock")) + ".png'/>";
        item += "</div></td><td></td></tr>";
        route_listview.append(item);
        if (i != route.l.length - 1) {
            var divider = "<tr class='tbl_divider'><td class='" + route.l[i].si + "_" + route.l[i + 1].si + "'></td><td><div style='width: 3em; height: 2.2em; overflow: hidden;' class='line_div'><a ssi='" + route.l[i].si + "' esi='" + route.l[i + 1].si + "'><img style='height: 100%; overflow: hidden;' src='images/line.png' /></a></div></td><td></td></tr>";
            route_listview.append(divider)
        }
        item = "<li data-icon=false stationId=" + route.l[i].si + "><a onclick='gotostationalert(" + route.l[i].i + ",\"" + route.l[i].n + "\")'>" + route.l[i].n + "</a></li>";
        gotostation_listview.append(item);
        waitbus_options[i] = route.l[i].i + "_" + route.l[i].n
    }
    if (common.getModuleRole("预测时间", sessionStorage.openId)) {
        $("#runbus_time").show();
        GetLocation()
    }
    gotostation_listview.listview("refresh");
    route_monitor_runningbus(id, direction);
    route_monitor_station_time(id, direction);
    if (history_flag) {
        history_flag = false;
        $.post("history/add", {
            id: id,
            name: route.rn,
            type: 1
        });
        $.post("userInteraction/queryCallBack", {
            type: "10"
        });
        if (common.getModuleRole("消息推送", sessionStorage.openId) && sessionStorage.openId) {
            $.getJSON("message/getPushMsgByOpenId/" + route.c + "/0", function(data) {
                if (data.length > 0) {
                    message_div.show();
                    message_btn.text("》新消息（" + data.length + "）").unbind().click(function() {
                        $.getJSON("message/getMsgByIdByOpenId/" + data[0].MsgId + "/" + data[0].MsgType, function(msg) {
                            message_popup.find("h3").html(msg.Title);
                            message_popup.find("p").html(msg.Content.replace(/\n/g, "<br>"));
                            data.shift();
                            message_btn.text("》新消息（" + data.length + "）");
                            if (data.length == 0) message_div.hide();
                            if (data.length > 0) {
                                message_popup.find("button").show().unbind().click(function() {
                                    message_btn.click()
                                })
                            } else {
                                message_popup.find("button").hide()
                            }
                            message_popup.popup("open")
                        })
                    })
                }
            })
        }
        if (common.getModuleRole("个人中心", sessionStorage.openId)) {
            $.get("user/isCareRoute/" + id, function(data) {
                if (data == "0") {
                    $("#guanzhu_div").show()
                }
            });
            $("#guanzhu_div a").click(function() {
                $.post("user/careRoute/" + id, function(data) {
                    if (data == "1") {
                        alert_popup.html("<p>关注成功，您可以在个人中心查看或取消关注此线路</p>").popup("open");
                        $("#guanzhu_div").hide()
                    }
                })
            })
        }
    }
    route_monitor_road_href()
}

function route_monitor_roadblock(id, direction) {
    if (common.getModuleRole("简图路况", sessionStorage.openId)) {
        if (route_listview.find(".line_div img[src!='images/line.png']").length > 0) {
            route_listview.find(".line_div img[src!='images/line.png']").attr("src", "images/line.png")
        }
        $.ajax({
            url: "road/getByRouteAndDirection/" + id + "/" + direction,
            success: function(data) {
                var roadblockArray = eval(data);
                var line_images = route_listview.find(".line_div img");
                for (var i = 0; i < roadblockArray.length - 1; i++) {
                    if (roadblockArray[i] == 1) {
                        line_images.eq(i).attr("src", "images/green_line.png")
                    } else if (roadblockArray[i] == 2) {
                        line_images.eq(i).attr("src", "images/orange_line.png")
                    } else if (roadblockArray[i] == 3) {
                        line_images.eq(i).attr("src", "images/red_line.png")
                    } else {
                        line_images.eq(i).attr("src", "images/line.png")
                    }
                }
            },
            beforeSend: function() {},
            error: function() {}
        })
    }
}

function route_monitor_road_href() {
    if (common.getModuleRole("详细路况", sessionStorage.openId)) {
        route_listview.find(".line_div a").each(function() {
            $(this).attr("href", "http://wbus.gzyyjt.net/wx/Road/Detail?src_sta=" + $(this).attr("ssi") + "&des_sta=" + $(this).attr("esi"))
        })
    }
}

function route_monitor_station_time(id, direction) {
    if (!common.getModuleRole("站间计时", sessionStorage.openId)) {
        return
    }
    $.getJSON("station/getTimeByRouteAndDirection/" + id + "/" + direction, function(data) {
        for (var i in data) {
            if (data[i].t == "null") {
                $("." + data[i].i).text("")
            } else {
                if (parseInt(data[i].t.split("　")[1].split(":")[0]) < 60) $("." + data[i].i).text(data[i].t.split("　")[1])
            }
        }
    })
}

function route_monitor_runningbus(id, direction) {
    $.getJSON("runBus/getByRouteAndDirection/" + id + "/" + direction, function(data) {
        sessionStorage.runBusDate = new Date().getTime();
        var runningbusArray = eval(data);
        route_listview.find("tr").each(function() {
            $(this).find("td:last").html("")
        });
        for (var i = 0; i < runningbusArray.length; i++) {
            if (runningbusArray[i].bl && runningbusArray[i].bl.length > 0) {
                var bus_ids = "";
                for (var k = 0; k < runningbusArray[i].bl.length; k++) {
                    bus_ids += "_" + runningbusArray[i].bl[k].i
                }
                var bus_td = "<div style='width: 5.5em; height: 1.7em; overflow: hidden;'><img style='width: 100%; height: 100%; overflow: hidden;' onclick='bus_operation(\"" + bus_ids.substring(1) + "\"," + i + "," + runningbusArray[i].bl[0].si + ")' src='images/" + (common.getModuleRole("新线路简图", sessionStorage.openId) ? (runningbusArray[i].bl.length > 1 ? "car" + runningbusArray[i].bl.length : (runningbusArray[i].bl[0].t > 0 ? "bus" + runningbusArray[i].bl[0].t : "bus")) : "car" + runningbusArray[i].bl.length) + ".png'/></div>";
                route_listview.find(".tbl_item:eq(" + i + ") td:last").append(bus_td)
            }
            if (runningbusArray[i].bbl && runningbusArray[i].bbl.length > 0) {
                var bus_ids = "";
                for (var k = 0; k < runningbusArray[i].bbl.length; k++) {
                    bus_ids += "_" + runningbusArray[i].bbl[k].i
                }
                var bus_td = "<div style='width: 5.5em; height: 1.7em; overflow: hidden;'><img style='width: 100%; height: 100%; overflow: hidden;' onclick='bus_operation(\"" + bus_ids.substring(1) + "\"," + i + "," + runningbusArray[i].bbl[0].si + ")' src='images/" + (common.getModuleRole("新线路简图", sessionStorage.openId) ? (runningbusArray[i].bbl.length > 1 ? "car" + runningbusArray[i].bbl.length : (runningbusArray[i].bbl[0].t > 0 ? "bus" + runningbusArray[i].bbl[0].t : "bus")) : "car" + runningbusArray[i].bbl.length) + ".png'/></div>";
                route_listview.find(".tbl_divider:eq(" + i + ") td:last").append(bus_td)
            }
        }
        route_refresh_btn.removeClass("ui-btn-active");
        route_direction_btn.removeClass("ui-btn-active");
        route_monitor_roadblock(id, direction)
    })
}

function deleteRemind(id, type, rn, rsn) {
    if (id && type && rn && rsn) {
        confirm_popup.find("p").html("确定取消<font color='red'>" + rn + "</font><font color='blue'>" + rsn + "</font>的" + (type == "1" ? "<font color='green'>候车提醒" : (type == "3" ? "<font color='#3388cc'>定时候车提醒" : "<font color='purple'>到站提醒")) + "</font>吗?")
    } else {
        var len = info_listview.find("li[name^='divider_']").length;
        if (len == 0) {
            info_popup.popup("close");
            alert_popup.html("<p>点此按钮可以清空未发送的提醒!</p>").popup("open");
            return
        }
        confirm_popup.find("p").html("确定取消<font color='red'>全部</font>未发送的提醒吗?")
    }
    confirm_popup.find("h3").html("取消提醒确认");
    confirm_popup.find("a").removeClass("ui-btn-active");
    confirm_popup.find("a:first").unbind().on("click", function() {
        confirm_popup.popup("close");
        if (id && type && rn && rsn) {
            $.post(type == "3" ? "time/deleteInfoById" : "info/deleteInfoById", {
                idStr: id
            }, function() {
                info_listview.find("li[name='" + type + "_" + id + "']").remove();
                var len = info_listview.find("li[name^='" + type + "_']").length;
                if (len == 0) {
                    info_listview.find("li[name='divider_" + type + "']").remove();
                    len = info_listview.find("li").length;
                    if (len == 0) {
                        var item = "<li data-icon=false style='text-align:center'>没有未发送的提醒</li>";
                        info_listview.append(item);
                        info_listview.listview("refresh")
                    }
                }
                info_popup.popup("open")
            })
        } else {
            $.post("info/deleteOpenId", function() {
                $.post("time/deleteOpenId", function() {
                    info_listview.html("");
                    var item = "<li data-icon=false style='text-align:center'>没有未发送的提醒</li>";
                    info_listview.append(item);
                    info_listview.listview("refresh");
                    info_popup.popup("open")
                })
            })
        }
    });
    confirm_popup.find("a:last").unbind().on("click", function() {
        confirm_popup.popup("close");
        info_popup.popup("open")
    });
    info_popup.popup("close");
    confirm_popup.popup("open")
}
route_direction_btn.click(function() {
    if (route_direction == 1) {
        route_direction = 0
    } else {
        route_direction = 1
    }
    if (client) {
        client.changeChannel({
            way: 1,
            oid: route_id,
            shuttle: route_direction == "0" ? 1 : 2
        });
        $("#chat_div .chat_record").empty();
        $("#chat_div_out").empty()
    }
    route_monitor_listview(route_id, route_direction)
});
route_refresh_btn.click(function() {
    route_monitor_runningbus(route_id, route_direction);
    route_monitor_station_time(route_id, route_direction);
    getWaitTime(position_rsi)
});
if (common.getModuleRole("用户交互", sessionStorage.openId)) {
    route_help_btn.find("font").html("更多");
    route_help_btn.click(more_operation)
} else {
    route_help_btn.click(function() {
        location.href = "route/demo/" + route_id + "/" + route_direction
    })
}

function more_operation() {
    operation_popup.find("ul li").show();
    operation_popup.popup("open")
}
info_btn.click(function() {
    $.getJSON("info/getUnSendInfoByOpenId", function(data) {
        info_listview.html("");
        if (data.length) {
            data.sort(function(a, b) {
                return a.type > b.type ? 1 : -1
            });
            var divider = null;
            for (var i = 0; i < data.length; i++) {
                if (divider != data[i].type) {
                    divider = data[i].type;
                    var item = "<li data-role='list-divider' style='color:#3388cc' name='divider_" + data[i].type + "'>" + (data[i].type == "1" ? "候车提醒" : "到站提醒") + "</li>";
                    info_listview.append(item)
                }
                var item = "<li data-icon='delete' name='" + data[i].type + "_" + data[i].i + "'><a>" + data[i].rn + "　" + data[i].rsn + "</a><a onclick=\"deleteRemind('" + data[i].i + "'," + data[i].type + ",'" + data[i].rn + "','" + data[i].rsn + "')\"></a></li>";
                info_listview.append(item)
            }
        }
        $.getJSON("time/getUnSendInfoByOpenId", function(data) {
            if (data.length) {
                for (var i = 0; i < data.length; i++) {
                    if (i == 0) {
                        var item = "<li data-role='list-divider' style='color:#3388cc' name='divider_3'>定时候车提醒</li>";
                        info_listview.append(item)
                    }
                    var day_names = data[i].dt.split(",");
                    var day_name = "";
                    for (var j in day_names) {
                        day_name += dayValueToName(day_names[j])
                    }
                    day_name = dayValueToName(day_name);
                    var item = "<li data-icon='delete' name='3_" + data[i].i + "'><a>" + data[i].rn + "　" + data[i].rsn + "<p>" + data[i].h + ":" + data[i].m + "提醒　" + day_name + "</p></a><a onclick=\"deleteRemind('" + data[i].i + "',3,'" + data[i].rn + "','" + data[i].rsn + "')\"></a></li>";
                    info_listview.append(item)
                }
            } else {
                if (!info_listview.html()) {
                    var item = "<li data-icon=false style='text-align:center'>没有未发送的提醒</li>";
                    info_listview.append(item)
                }
            }
            info_listview.listview("refresh");
            info_popup.popup("open")
        })
    })
});

function dayValueToName(day) {
    var rs = "";
    switch (day) {
        case "-1":
            rs = "仅一次";
            break;
        case "1":
            rs = "周一";
            break;
        case "2":
            rs = "周二";
            break;
        case "3":
            rs = "周三";
            break;
        case "4":
            rs = "周四";
            break;
        case "5":
            rs = "周五";
            break;
        case "6":
            rs = "周六";
            break;
        case "7":
            rs = "周日";
            break;
        default:
            rs = day.replace("周一周二周三周四周五周六周日", "每天").replace("周一周二周三周四周五", "工作日").replace("周六周日", "周末")
    }
    return rs
}

function waitbus_changeMode(value) {
    mode_value = value;
    if (value) {
        if (!$("#immediate").hasClass("ui-btn-active")) {
            $("#immediate").addClass("ui-btn-active");
            $("#timer").removeClass("ui-btn-active");
            timer_btn.attr("disabled", true)
        }
    } else {
        if (!$("#timer").hasClass("ui-btn-active")) {
            $("#timer").addClass("ui-btn-active");
            $("#immediate").removeClass("ui-btn-active");
            timer_btn.attr("disabled", false)
        }
    }
}
timer_popup.find("div[data-role='navbar'] a:first").unbind().on("click", function() {
    var regExp = new RegExp("^([0-1][0-9]|2[0-3]):[0-5][0-9]$");
    if (!timer_popup.find("#time_input").val() || !regExp.test(timer_popup.find("#time_input").val())) {
        timer_popup.find("#time_input").focus();
        setTimeout(function() {
            timer_popup.find("a").removeClass("ui-btn-active")
        }, 10);
        return
    }
    days_value = "";
    var days_text = "";
    timer_popup.find("a[type='checkbox'].ui-btn-active").each(function() {
        days_value += $(this).attr("value") + ",";
        days_text += $(this).text()
    });
    days_value = days_value.substring(0, days_value.length - 1);
    time_value = timer_popup.find("#time_input").val();
    var text = $.trim(dayValueToName(days_text));
    timer_btn.text(time_value + "提醒 " + text);
    timer_popup.popup("close");
    waitbus_popup.popup("open")
});
timer_popup.find("div[data-role='navbar'] a:last").unbind().on("click", function() {
    timer_popup.popup("close");
    waitbus_popup.popup("open")
});
timer_popup.find("a[type='checkbox']").click(function() {
    if ($(this).hasClass("ui-btn-active")) {
        if (timer_popup.find("a[type='checkbox'].ui-btn-active").length > 1) $(this).removeClass("ui-btn-active")
    } else {
        if ($(this).attr("id") == "once") {
            timer_popup.find("a[type='checkbox'].ui-btn-active").removeClass("ui-btn-active")
        } else {
            timer_popup.find("#once.ui-btn-active").removeClass("ui-btn-active")
        }
        $(this).addClass("ui-btn-active")
    }
});
timer_btn.click(function() {
    waitbus_popup.popup("close");
    timer_popup.find("a").removeClass("ui-btn-active");
    var data = $(this).text().split("提醒 ");
    $("#time_input").val(data[0]);
    timer_popup.find("a[type='checkbox'].ui-btn-active").removeClass("ui-btn-active");
    if (data[1] == "仅一次") {
        timer_popup.find("#once").addClass("ui-btn-active")
    } else if (data[1] == "工作日") {
        timer_popup.find(".work_day").addClass("ui-btn-active")
    } else if (data[1] == "周末") {
        timer_popup.find(".week_end").addClass("ui-btn-active")
    } else if (data[1] == "每天") {
        timer_popup.find("a[type='checkbox'][id!='once']").addClass("ui-btn-active")
    } else {
        var days = days_value.split(",");
        for (var i = 0; i < days.length; i++) {
            timer_popup.find("a[type='checkbox'][value='" + days[i] + "']").addClass("ui-btn-active")
        }
    }
    timer_popup.popup("open")
});
var firstWaitTime = true;

function getWaitTime(rsi) {
    if (!common.getModuleRole("预测时间", sessionStorage.openId)) {
        return
    }
    $.post("waitBus/waitTime", {
        rsId: rsi,
        num: "3"
    }, function(data) {
        if (!data) {
            return
        }
        $("#runbus_time .time_num").each(function(i) {
            $(this).siblings(".time_txt").hide();
            var txt = null;
            if (data[i].count == 0) {
                txt = "已进站";
                $(this).css("font-size", "1.2em").html(txt)
            } else if (data[i].count == -1) {
                txt = "尚未发车";
                $(this).css("font-size", "1.2em").html(txt)
            } else {
                txt = data[i].count + "站";
                $(this).css("font-size", "1.5em").html(data[i].time + "′");
                $(this).siblings(".time_txt").css("margin-left", 3 - $(".testmin").width() + "px").html(txt).show()
            }
        });
        if (firstWaitTime) {
            firstWaitTime = false;
            $(window).resize();
            setTimeout('scroll(0,' + ($(".tbl_item img[data-rsi='" + position_rsi + "']").offset().top - ($(window).height() - route_header_title.height() - route_page.find("div:jqmData(role='footer')").height()) / 2 - 18) + ')', 1)
        }
    }, "json")
}

function GetLocation() {
    var options = {
        enableHighAccuracy: true
    };
    if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)
    } else {
        alert("浏览器不支持html5来获取地理位置信息")
    }
}

function handleSuccess(position) {
    $.post("routeStation/getNearStationByRoute/" + route_id + "/" + route_direction, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    }, function(data) {
        position_rsi = data.i;
        $(".tbl_item img[data-rsi='" + position_rsi + "']").attr("src", "images/people.png");
        setTimeout('scroll(0,' + ($(".tbl_item img[data-rsi='" + position_rsi + "']").offset().top - ($(window).height() - route_header_title.height() - route_page.find("div:jqmData(role='footer')").height()) / 2 - 18) + ')', 1);
        getWaitTime(position_rsi)
    }, "json")
}

function handleError(error) {
    $(".tbl_item img[data-rsi='" + position_rsi + "']").attr("src", "images/people.png");
    setTimeout('scroll(0,' + ($(".tbl_item img[data-rsi='" + position_rsi + "']").offset().top - ($(window).height() - route_header_title.height() - route_page.find("div:jqmData(role='footer')").height()) / 2 - 18) + ')', 1);
    getWaitTime(position_rsi)
}
