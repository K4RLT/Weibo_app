import webview

LOGIN_URL = 'https://passport.weibo.com/sso/signin?entry=miniblog&source=miniblog&disp=popup&url=https%3A%2F%2Fweibo.com%2Fnewlogin%3Ftabtype%3Dweibo%26gid%3D102803%26openLoginLayer%3D0%26url%3Dhttps%3A%2F%2Fwww.weibo.com%2F&from=weibopro'

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
