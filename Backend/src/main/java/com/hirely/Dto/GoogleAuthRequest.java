package com.hirely.Dto;

public class GoogleAuthRequest {

    private String credential;
    private String email;
    private String name;
    private String sub;
    private String picture;
    private String role;

    public GoogleAuthRequest() {
    }

    public GoogleAuthRequest(String credential, String email, String name, String sub, String picture, String role) {
        this.credential = credential;
        this.email = email;
        this.name = name;
        this.sub = sub;
        this.picture = picture;
        this.role = role;
    }

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSub() {
        return sub;
    }

    public void setSub(String sub) {
        this.sub = sub;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
