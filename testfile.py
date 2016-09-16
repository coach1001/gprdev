import urllib2

def main():
    download_file("http://10.0.0.111:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2FGPR%2FReports&reportUnit=%2FGPR%2FReports%2FRPT_QR_CODE_APPLICATION&application_id_list=10017&standAlone=true&output=pdf&j_username=reportConsumer&j_password=password")

def download_file(download_url):
    response = urllib2.urlopen(download_url)
    file = open("document.pdf", 'wb')
    file.write(response.read())
    file.close()
    print("Completed")

if __name__ == "__main__":
    main()