class CustomFailureApp < Devise::FailureApp
  def redirect_url
    # Redirect to custom admin login page if accessing /admin
    if request.fullpath.starts_with?("/admin")
      "/admin_login.html"
    else
      super
    end
  end

  def respond
    if http_auth?
      http_auth
    else
      redirect
    end
  end
end
