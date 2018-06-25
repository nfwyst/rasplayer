from django.conf import settings
import pygame
import sys

def play(name = 'Alan Walker - Fade.mp3'):
    path = '/Users/iMalisheng/media' + '/' + name
    pygame.init()
    pygame.mixer.init()
    pygame.time.delay(1000)
    pygame.mixer.music.load(path)
    pygame.mixer.music.set_volume(1)
    pygame.mixer.music.set_endevent(pygame.USEREVENT + 1)
    pygame.mixer.music.play()
    while True:
        for event in pygame.event.get():
            if event.type == pygame.USEREVENT + 1:
                print('播放结束')
                sys.exit()

# play()
