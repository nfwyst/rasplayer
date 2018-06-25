from django.shortcuts import render, HttpResponse
import logging
import json
import os
from mutagen.mp3 import MP3
from django.conf import settings
from server.models import *
from django.contrib.auth.admin import User

import urllib
import threading
from multiprocessing import Queue
import pygame

logger = logging.getLogger('server.views')
server_url = 'http://127.0.0.1:8000' + settings.MEDIA_URL
filename = '/Users/iMalisheng/media/api.json'

# 请求歌曲列表
def list(request):
    try:
        folder = settings.MEDIA_ROOT
        id = 1
        api = []
        item_list = []
        try:
            for file in os.listdir(folder):
                item = file.split('.')
                if item[1] == 'mp3':
                    item_list.append(item[0])
        except Exception as e:
                return HttpResponse(json.dumps({'content': 0}), content_type='application/json')
        # 解析
        for item in item_list:
            m_obj = {}
            m_obj['id'] = id
            id = id + 1
            m_obj['name'] = item.split('-')[1].strip()
            m_obj['artist'] = item.split('-')[0].strip()
            # get file info
            audio = MP3(os.path.join(folder, item + '.mp3'))
            m_obj['duration'] = audio.info.length

            m_obj['music'] = os.path.join(server_url, item + '.mp3')
            m_obj['poster'] = os.path.join(server_url, item.split('-')[0].strip() + '.jpg')
            m_obj['lyric'] = os.path.join(server_url, item + '.lrc')
            api.append(m_obj)
        # 将数据保存到文件当中
        with open(filename, 'w') as f:
            f.write(json.dumps(api))
    except Exception as e:
        logger.error(e)
        print(e)
    return HttpResponse(json.dumps(api), content_type='application/json')

# 请求首页信息
def api(request):
    data = {}
    try:
        api = 'http://news-at.zhihu.com/api/4' + request.path
        data = json.load(urllib.request.urlopen(api))
    except Exception as e:
        logger.error(e)
        print(e)
    return HttpResponse(json.dumps(data), content_type='application/json')

# 请求图片代理
def proxy(request):
    if (not request.GET.get("img")):
        return HttpResponse({"error": true, "reason": "no such a url"}, content_type="application/json")

    url = request.GET.get("img")

    req = urllib.request.Request(url)
    req.add_header('Referer', 'http://news-at.zhihu.com/')
    resp = urllib.request.urlopen(req)
    content = resp.read()
    return HttpResponse(content)

# 登录请求
def login(request):
    try:
        name = request.POST.get('username')
        pwd = request.POST.get('password')
        user = User.objects.get(username=name)
        if user and pwd == 'ad128508':
            return HttpResponse(json.dumps({'isvalid': True}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({'isvalid': False}), content_type="application/json")
    except Exception as e:
        return HttpResponse(json.dumps({'isvalid': False}), content_type="application/json")

# 处理播放请求
def play(request):
    try:
        request_id = request.GET.get('id')
        fresh = 0
        try:
            fresh = int(request.GET.get('fresh'))
        except Exception as e:
            pass

        with open(filename) as f:
            data = []
            try:
                data = json.loads(f.read())
            except Exception as e:
                resetHead = f.read().split(']')[0] + ']'
                data = json.loads(resetHead)
            try:
                if data[-1]['playingId']:
                    data.pop()
            except KeyError as e:
                pass

        for item in data:
            if isinstance(item, dict) and str(item['id']) == request_id:
                if fresh:
                    data.append({'playingId': request_id, 'path': settings.MEDIA_ROOT + '/' +  item['music'].split('/')[4], 'puased': 0, 'fresh': fresh})
                    data = str(data).replace('\'', '"')
                    with open(filename, 'w') as f:
                        f.write(data)
                        break;
                else:
                    data.append({'playingId': request_id, 'path': settings.MEDIA_ROOT + '/' +  item['music'].split('/')[4], 'puased': 0})
                    data = str(data).replace('\'', '"')
                    with open(filename, 'w') as f:
                        f.write(data)
                        break;
        return HttpResponse(json.dumps({'success': True}), content_type="application/json")
    except Exception as e:
        logger.error(e)
        print(e)
        return HttpResponse(json.dumps({'success': False}), content_type="application/json")
    return HttpResponse(json.dumps({'success': False}), content_type="application/json")

# 处理暂停
def puase(request):
    try:
        request_id = request.GET.get('id')
        st = request.GET.get('st')
        with open(filename) as f:
            data = json.loads(f.read())
        try:
            if data[-1]['playingId']:
                data.pop()
        except KeyError as e:
            pass

        for item in data:
            if isinstance(item, dict) and str(item['id']) == request_id:
                if st == '1':
                    data.append({'playingId': request_id, 'path': settings.MEDIA_ROOT + '/' +  item['music'].split('/')[4], 'puased': 1})
                    data = str(data).replace('\'', '"')
                    with open(filename, 'w') as f:
                        f.write(data)
                        break;
                elif st == '0':
                    data.append({'playingId': request_id, 'path': settings.MEDIA_ROOT + '/' +  item['music'].split('/')[4], 'puased': 0})
                    data = str(data).replace('\'', '"')
                    with open(filename, 'w') as f:
                        f.write(data)
                        break;
                elif st == '11':
                    data.append({'playingId': -2, 'path': settings.MEDIA_ROOT + '/' +  item['music'].split('/')[4], 'puased': 1})
                    data = str(data).replace('\'', '"')
                    with open(filename, 'w') as f:
                        f.write(data)
                        break;
    except Exception as e:
        logger.error(e)
        print(e)
        return HttpResponse(json.dumps({'success': False}), content_type="application/json")
    return HttpResponse(json.dumps({'success': True}), content_type="application/json")

def mute(request):
    try:
        request_id = request.GET.get('id')
        muteSt = int(request.GET.get('mute'))
        with open(filename) as f:
            data = json.loads(f.read())
        try:
            if data[-1]['playingId']:
                data.pop()
        except KeyError as e:
            pass

        for item in data:
            if isinstance(item, dict) and str(item['id']) == request_id:
                data.append({'playingId': request_id, 'path': settings.MEDIA_ROOT + '/' + item['music'].split('/')[4],'puased': 0,'mute': muteSt})
                data = str(data).replace('\'', '"')
                with open(filename, 'w') as f:
                    f.write(data)
                    break;
    except Exception as e:
        logger.error(e)
        print(e)
        return HttpResponse(json.dumps({'success': False}), content_type="application/json")
    return HttpResponse(json.dumps({'success': True}), content_type="application/json")
