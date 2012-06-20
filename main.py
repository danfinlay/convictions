#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import webapp2
import jinja2
import re
import cgi
import random
import string
import hashlib
from google.appengine.ext import db
import logging
import datetime
import time
import json

SIMPLE_TYPES = (int, long, float, bool, dict, basestring, list)
error = ''

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape = True)

secret = 'seI44ka5%1~fjarjfkls~UuKLf84$r2rdakbl48'

def to_dict(model):
    output = {}

    for key, prop in model.properties().iteritems():
        value = getattr(model, key)

        if value is None or isinstance(value, SIMPLE_TYPES):
            output[key] = value
        elif isinstance(value, datetime.date):
            # Convert date/datetime to ms-since-epoch ("new Date()").
            ms = time.mktime(value.utctimetuple())
            ms += getattr(value, 'microseconds', 0) / 1000
            output[key] = int(ms)
        elif isinstance(value, db.GeoPt):
            output[key] = {'lat': value.lat, 'lon': value.lon}
        elif isinstance(value, db.Model):
            output[key] = to_dict(value)
        else:
            raise ValueError('cannot encode ' + repr(prop))

    return output

def make_secure_val(val):
	return '%s|%s' % (val, hashlib.sha256(secret + str(val)).hexdigest())

def check_secure_val(secure_val):
	logging.error("Checking secure value of \n" + secure_val)
	val = secure_val.split('|')[0]
	logging.error("Comparing it to \n" + make_secure_val(val))
	if secure_val == make_secure_val(val):
		logging.error("Value found to be secure.")
		return val

def id_from_hash(secure_val):
	val = secure_val.split('|')[0]
	return val

def make_salt():
    return ''.join(random.choice(string.letters) for x in xrange(5))

def make_pw_hash(name, pw, salt=None):
	if not salt:
		salt = make_salt()
	h = hashlib.sha256(name + pw + salt).hexdigest()
	return '%s,%s' % (salt, h)

def valid_pw(name, pw, h):
    salt = h.split(',')[0]
    return h == make_pw_hash(name, pw, salt)



def build_topic_dict_from_conviction(conviction):
	result = {}
	conviction_dict = to_dict(conviction)
	result["text"] = conviction_dict["text"]
	result["id"] = conviction.key().id()
	result["votes_for"] = conviction_dict["votes_for"]
	result["votes_against"] = conviction_dict["votes_against"]
	result["reasons_for"] = []
	result["reasons_against"] = []
	for reasons in conviction.reasons_for_set:
		reason = dict_for_reason(reasons)
		reason["type"] = "agree"
		result["reasons_for"].append(reason)
	for reasons in conviction.reasons_against_set:
		reason = dict_for_reason(reasons)
		reason["type"] = "disagree"
		result["reasons_against"].append(reason)
	return result

def dict_for_reason(node):
	conviction_dict = to_dict(node)
	conviction_dict.pop("reason_for")
	conviction_dict.pop("reason_against")
	conviction_dict.pop("citation_for")
	reasons_for = []
	reasons_against = []
	citations_for = []
	for reasons in node.reasons_for_set:
		reason = {}
		reason["text"] = reasons.text
		reason["id"] = reasons.key().id()
		reason["support_count"] = reasons.reasons_for_set.count()
		reason["objection_count"] = reasons.reasons_against_set.count()
		reason["evidence_count"] = reasons.citation_set.count()
		reasons_for.append(reason)
	for reasons in node.reasons_against_set:
		reason = {}
		reason["text"] = reasons.text
		reason["id"] = reasons.key().id()
		reason["support_count"] = reasons.reasons_for_set.count()
		reason["objection_count"] = reasons.reasons_against_set.count()
		reason["evidence_count"] = reasons.citation_set.count()
		reasons_against.append(reason)
	if node.citation_set:
		for reasons in node.citation_set:
			reason = {}
			reason["text"] = reasons.text
			reason["id"] = reasons.key().id()
			reason["support_count"] = reasons.reasons_for_set.count()
			reason["objection_count"] = reasons.reasons_against_set.count()
			reason["evidence_count"] = reasons.citation_set.count()
			citations_for.append(reason)
	conviction_dict["citations_for"] = citations_for
	conviction_dict["reasons_for"] = reasons_for
	conviction_dict["reasons_against"] = reasons_against
	return conviction_dict
	
def json_from_reason_dict(conviction_dict):
	load_conviction = json.dumps(conviction_dict)
	logging.error("Json : " + load_conviction)
	return load_conviction

class Reason(db.Model):
	created = db.DateTimeProperty(auto_now_add = True)
	text = db.StringProperty(required = True)
	is_citation = db.BooleanProperty(required=True)
	reason_for = db.ReferenceProperty(collection_name='reasons_for_set')
	reason_against = db.ReferenceProperty(collection_name='reasons_against_set')
	citation_for = db.SelfReferenceProperty(collection_name = "citation_set")
	reasoned = db.ReferenceProperty(collection_name = "reasoned_set")

class Conviction(db.Model):
	created = db.DateTimeProperty(auto_now_add = True)
	text = db.StringProperty(required = True)
	votes_for = db.IntegerProperty(required = False)
	votes_against = db.IntegerProperty(required=False)
	convicted = db.ReferenceProperty(collection_name = "convicted_set")

class User(db.Model):
	name = db.StringProperty(required = True)
	passwordhash = db.StringProperty(required=True)
	email = db.StringProperty()

class Handler (webapp2.RequestHandler):
	def write(self, *a, **kw):
		self.response.out.write(*a, **kw)
		
	def render_str(self, template, **params):
		t = jinja_env.get_template(template)
		return t.render(params)
		
	def render(self, template, **kw):
		self.write(self.render_str(template, **kw))

	def set_secure_cookie(self, name, val):
		cookie_val = make_secure_val(val)
		self.response.headers.add_header(
			'Set-Cookie',
			'%s=%s; Path=/' % (name, cookie_val))

	def read_secure_cookie(self, name):
		cookie_val = self.request.cookies.get(name)
		return cookie_val and check_secure_val(cookie_val)

	def login(self, user):
		self.set_secure_cookie('user_id', str(user.key().id()))

	def initialize(self, *a, **kw):
		webapp2.RequestHandler.initialize(self, *a, **kw)
		uid = self.read_secure_cookie('user_id')
		self.user = uid and User.by_id(int(uid))

class MainHandler(Handler):
	def render_front(self, convictions = []):
		self.render("index.html", convictions = convictions)
	def get(self):
		topics = db.GqlQuery("Select * from Conviction order by created desc")
		self.render_front(topics)

class NewConvictionHandler(Handler):
	def render_front(self, text = '', error = ''):
		self.render("new-conviction.html", text = text, error = error)
	def get(self, text = ''):
		self.render_front(text = '')
	def post(self):
		body = self.request.get("text")
		if body:
			c = Conviction(text = body, votes_for = 0, votes_against = 0)
			c_key = c.put()

			self.redirect("/topic/%s" % str(c_key.id()))
		else:
			error = "We need a post body."
			self.render_front(conviction = body, error = error)

load_conviction = ''
def json_from_set(set):
	conviction_dict = to_dict(set)
	reasons_for = []
	reasons_against = []
	for reasons in s.reasons_for_set:
		reason = {}
		reason["text"] = reasons.text
		reason["id"] = reasons.key().id()
		reasons_for.append(reason)
	for reasons in s.reasons_against_set:
		reason = {}
		reason["text"] = reasons.text
		reason["id"] = reasons.key().id()
		reasons_against.append(reason)
	conviction_dict["reasons_for"] = reasons_for
	conviction_dict["reasons_against"] = reasons_against
	return json.dumps(conviction_dict)

class ConvictionHandler(Handler):

	def render_front(self, conviction = '', agree = 0, disagree = 0, id = '', reasons = []):
		self.render("conviction.html", conviction = conviction, 
			agree = agree, disagree=disagree, id=id, reasons = reasons)
	def get(self, conviction_id):
		topic = int(conviction_id)
		s = Conviction.get_by_id(topic)
		if s:

			reason_list = []
			for reasons in s.reasons_for_set:
				reason = {}
				reason["type"] = "agree"
				reason["text"] = reasons.text
				reason["id"] = reasons.key().id()
				if hasattr(reasons, 'reason_for_set'):
					reason["support_count"] = len(reasons.reason_for_set)
				if hasattr(reasons, 'reason_against_set'):
					reason["objection_count"] = len(reasons.reason_against_set)
				if hasattr(reasons, 'evidence_set'):
					reason["evidence_count"] = len(reasons.evidence_set)
				reason_list.append(reason)
			for reasons in s.reasons_against_set:
				reason = {}
				reason["type"] = "disagree"
				reason["text"] = reasons.text
				reason["id"] = reasons.key().id()
				if hasattr(reasons, 'reason_for_set'):
					reason["support_count"] = len(reasons.reason_for_set)
				if hasattr(reasons, 'reason_against_set'):
					reason["objection_count"] = len(reasons.reason_against_set)
				if hasattr(reasons, 'evidence_set'):
					reason["evidence_count"] = len(reasons.evidence_set)
				reason_list.append(reason)

			self.render_front(conviction = s, agree = 0, disagree =0, 
				id=str(conviction_id), reasons = reason_list)
	def post(self, conviction_id):

		status = 0
		logging.error("post request received:" + self.request.body)
		body = self.request.get("supportText")
		if body:
			logging.error("Reason type: " + self.request.get("supportText"))
			status = 1
		else:
			body = self.request.get("objectText")
			if body:
				logging.error("Objection type: " + self.request.get("objectText"))
				self.redirect("/topic/" + str(conviction_id))
				status = 1
			else:
				logging.error("Isn't a new topic...")
				logging.error(self.request.headers)
				logging.error(self.request.query_string)
				body = self.request.get("text")
				if body:
					replyTo = self.request.get("replyTo")
					status = 2
					replyType = int(self.request.get("type"))
					logging.error("Reply type: " + str(replyType))
					r = Reason.get_by_id(int(replyTo))
					if r:
						logging.error("Retrieved.")
						reason = to_dict(r)
						logging.error("Retrieved reason: " + str(reason["text"]))

						if replyType == 0:
							newReason = Reason(text = body, is_citation = False, reason_for = r)
							newReason.put()
							r = Reason.get_by_id(int(replyTo))
							if r:
								self.response.out.write(json_for_reason(r))
						if replyType == 1:
							newReason = Reason(text = body, is_citation = False, reason_against = r)
							newReason.put()
							r = Reason.get_by_id(int(replyTo))
							if r:
								self.response.out.write(json_for_reason(r))
						if replyType == 2:
							newReason = Reason(text = body, is_citation = True, citation_for = r)
							newReason.put()
							r = Reason.get_by_id(int(replyTo))
							if r:
								self.response.out.write(json_for_reason(r))

		if status == 1:
			c = Conviction.get_by_id(int(conviction_id))
			if c:
				logging.error("retrieved conviction.")

				if len(self.request.get("supportText")) > 0:
					r = Reason(text = self.request.get("supportText"), is_citation = False, reason_for=c)
				else:
					r = Reason(text = self.request.get("objectText"), is_citation = False, reason_against=c)
				r.put()
				logging.error("Posted reason.")





class ConvictionJSONHandler(Handler):
	def render_front(self, conviction = '', error = ''):
		self.render("conviction.html", conviction = load_conviction, error = error)
	def get(self, conviction_id):
		s = Conviction.get_by_id(int(conviction_id))
		if s:
			response_dict = build_topic_dict_from_conviction(s)
			response_string = json.dumps(response_dict)
			self.response.out.write(response_string)


app = webapp2.WSGIApplication([('/', MainHandler),
								('/topic/(\d+)', ConvictionHandler),
								('/topic/new', NewConvictionHandler),
								('/topic/(\d+).json', ConvictionJSONHandler)],
                              debug=True)
