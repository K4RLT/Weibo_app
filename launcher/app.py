import webview

LOGIN_URL = 'https://passport.weibo.com/sso/signin'

def main():
    # Create persistent session webview window for Weibo
    window = webview.create_window(
        title='Weibo Desktop (新浪微博)',
        url=LOGIN_URL,
        width=1280,
        height=840,
        resizable=True,
        min_size=(800, 600)
    )
    webview.start(private_mode=False)

if __name__ == '__main__':
    main()
