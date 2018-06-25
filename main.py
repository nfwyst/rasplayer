#!/usr/local/bin/python3
# -*- coding: utf-8 -*-
import pygame
import sys
import time
import json

# pygame 初始化
pygame.init()
pygame.mixer.init()
pygame.time.delay(1000)
player = pygame.mixer.music
filename = '/Users/iMalisheng/media/api.json'

oldcontent = ""
# 数据初始化
with open(filename) as f:
    oldcontent = f.read()

current_id = 0
#读取文件
class Tail():
    def __init__(self, file_name, callback=sys.stdout.write):
        self.file_name = file_name
        self.callback = callback

    def follow(self):
        global oldcontent
        try:
            while True:
                with open(self.file_name) as f:
                    content = f.read()
                    if content != oldcontent and content != "":
                        oldcontent = content
                        self.callback(content)
            # time.sleep(1)
        except Exception as e:
            print(e)

# 内容处理函数
def resolve(content):
    content = json.loads(content)
    playingId = 0
    puased = 0
    mute = -1
    fresh = 0
    global current_id
    try:
        for item in content:
            try:
                playingId = item['playingId']
                puased = item['puased']
            except KeyError as e:
                pass
            try:
                mute = item['mute']
            except KeyError as e:
                pass
            try:
                fresh = item['fresh']
            except KeyError as e:
                pass
            if playingId:
                play_music(item['path'], puased, playingId, mute, fresh)
                current_id = playingId
                return
    except Exception as e:
        print(e)

def play_music(path, puased, ids, mute, fresh):
    if puased == 0:
        if (ids != current_id) or fresh != 0:
            if player.get_busy():
                player.stop()
            player.load(path)
            player.set_volume(1)
            player.play()
        else:
            player.unpause()
    elif puased == 1:
        player.pause()

    if mute == 1:
        player.set_volume(0)
    elif mute == 0:
        player.set_volume(1)

    return

if __name__ == '__main__':
    tail = Tail(filename, resolve)
    tail.follow()
