from django.conf.urls import url
from server.views import *
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name="index.html")),
    url(r'^interface$',  TemplateView.as_view(template_name="home.html")),
    url(r'^media/(?P<path>.*$)', serve, {'document_root': settings.MEDIA_ROOT,}, name='media'),
    url(r'^api/list$', list, name='list'),
    url(r'^news/latest$', api, name='api'),
    url(r'^img/proxy$', proxy, name='proxy'),
    url(r'^news/\d*$', api, name='api'),
    url(r'^login$', login),
    url(r'^play?\w\d*$', play),
    url(r'^puase?\w\d*$', puase),
    url(r'^mute?\w\d*$', mute),
]
