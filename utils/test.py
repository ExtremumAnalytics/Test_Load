# # successful = 3
# # gauge_value = 0
# #
# #
# # def my_function():
# #     global successful, gauge_value
# #
# #     # Yahaan kuchh code ho sakta hai jisse successful aur gauge_value ka value set hota hai.
# #     # Jaise ki successful = 1 ho ya kisi calculation ke through gauge_value ka value set kiya jaaye.
# #
# #     # Yahan gauge_value ko 1 se 100 ke beech map kiya gaya hai.
# #     gauge_value += 1
# #     if gauge_value > 100:
# #         gauge_value = 1
# #
# #
# # # Function ko call karte hain
# # my_function()
# #
# # # Global variables ki value print karte hain
# # print("successful:", successful)
# # print("gauge_value:", gauge_value)
#
# total_success_rate = 0
# over_all_readiness = 0
#
#
# def update_values(total_files_list, tot_succ):
#     global total_success_rate
#     global over_all_readiness
#
#     total_success_rate += tot_succ
#     over_all_readiness += total_files_list
#
#
# def display_values():
#     print('Total Success Rate:', total_success_rate)
#     print('Overall Readiness:', over_all_readiness)

#
# total_success_rate = 0
# over_all_readiness = 0
#
#
# def update_values(total_files_list, tot_succ):
#     global total_success_rate
#     global over_all_readiness
#
#     total_success_rate += tot_succ
#     over_all_readiness += total_files_list
#
#
# def display_values():
#     print('Total Success Rate:', total_success_rate)
#     print('Overall Readiness:', over_all_readiness)
#
#
# # Example usage:
# update_values(122, 20)
# display_values()
#
Limit_By_Size = '0'
mb_pop = 3.0
Limit_By_Size = int(Limit_By_Size)
if mb_pop <= Limit_By_Size or Limit_By_Size == 0:
    print('Limit By Size(K/Count) file size exceeds')
else:
    print('condition fail')


os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_BASE"] = "https://ea-openai.openai.azure.com/"
os.environ["OPENAI_API_KEY"] = "2355a247f79f4b8ea2adaa0929cd32c2"
os.environ["OPENAI_API_VERSION"] = "2023-05-15"