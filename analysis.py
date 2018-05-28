#!/usr/bin/env python
# -*- coding: utf-8 -*-

import geocoder
import json
from pprint import pprint
from dotenv import load_dotenv
import os

import plotly
# import plotly.plotly as py
import plotly.graph_objs as go
import operator

# 545/51588/95056 (not find/include country/all) for vue repo, China:15836 (0.307), Taiwan: 664
# 550/59582/96468 for react repo, China:12033 (0.202), Taiwan: 724
# 197/21858/36510 for angular repo, China:3611, taiwan: 188

# ref: https://stackoverflow.com/questions/44208780/find-the-county-for-a-city-state
# https://developers.google.com/maps/documentation/geocoding/start

class Analysis():
    def __init__(self):
        self.files = ["vuejs-vue", "facebook-react", "angular-angular"]
    def get_country(self, location, google_key):
        result = geocoder.google(location, key=google_key, rate_limit=False)
        if result != None:
            return result.country_long # result.country
        return result    

    def read_render(self, if_draw=False):
        # use bar chart or pie char to show
        print("read_render")
        group_data = [] 
        for file_name in self.files:
            histogram_dict = {}    
            # file_name = "test3" # for testing
            with open(file_name+"-country.json") as f:
                data = json.load(f)
            userList = data["locationStargazerList"]
            for user in userList:
                # if user["country"] == "None"
                #     if 'not_found' in histogram_dict:
                #         histogram_dict["not_found"] =  histogram_dict["not_found"]+1
                #     else:
                #         histogram_dict["not_found"] = 1
                # else:
                country = user["country"]
                if country in histogram_dict:
                    histogram_dict[country] =  histogram_dict[country]+1
                else:
                    histogram_dict[country] = 1
            # number_empty = total - len(userList)
            # if number_empty > 0:
            #     histogram_dict["empty"] = number_empty                                                                  
            # use histogram_dict to draw
            sorted_h = sorted(histogram_dict.items(), key=operator.itemgetter(1), 
                reverse=True)  
            x_list = []
            y_list = []

            for pair in sorted_h:
                if pair[1]<200:
                    break    
                else:
                    if pair[0] != "None":
                        x_list.append(pair[0])
                        y_list.append(pair[1])

            trace_data = go.Bar(
                x= x_list,#[i[0] for i in sorted_h], #list(histogram_dict.keys()), #['giraffes', 'orangutans', 'monkeys'],
                y= y_list, #[i[1] for i in sorted_h] #list(histogram_dict.values()) # [20, 14, 23]
                name = file_name
            )
            group_data.append(trace_data)  
        layout = go.Layout(
            barmode='group'
        )              
        fig = go.Figure(data=group_data, layout=layout)
        if if_draw == True:
            print("start to draw chart")
            plotly.offline.plot(fig)
        else:
            return fig    

    def append_countries(self):
        load_dotenv(verbose=True)
        google_key = os.getenv("GOOGLE_GEOCODE_API_KEY")

        for file_name in self.files:
            # file_name = "test3" # for testing
            with open(file_name+".json") as f:
                data = json.load(f)

            userList = data["locationStargazerList"]
            # total = data["totalStargazers"]
            # histogram_dict = {}     
            # pprint(data)
            loop_times = 0
            for user in userList: # ~ 50000
                if loop_times%50 == 0:
                    print("loop:{}".format(loop_times))
                loop_times = loop_times+1
                # print(user["location"])
                # print(user["login"])
                country = self.get_country(user["location"], google_key)
                if country == None:
                    user["country"] = "None"
                else:
                    user["country"] = country

            with open(file_name+"-country.json", 'w') as file:
                # file.write(json.dumps(data)) 
                # json.dump(data, file) # all are in 1 line
                json.dump(data, file, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    print("start test of analysis")    
    cc = Analysis()
    # cc.append_countries()     
    cc.read_render(if_draw=True)            
    print("end test of analysis")