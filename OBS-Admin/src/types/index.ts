export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  category_image?: string;
  image_gallery?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ProductSubCategory {
  id: string;
  product_category_id: string;
  name: string;
  sub_category_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface Finish {
  id: string;
  name: string;
  image?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  product_category_id?: string;
  product_sub_category_id?: string;
  name: string;
  item_code: string;
  description?: string;
  main_image?: string;
  image_gallery?: string[];
  sizes?: string;
  features?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  name: string;
  image?: string;
  created_at: string;
  updated_at?: string;
}

export interface Exhibition {
  id: string;
  title: string;
  description?: string;
  video_link?: string[];
  start_date?: string;
  end_date?: string;
  image_gallery?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Blog {
  id: string;
  title: string;
  content?: string;
  video_link?: string[];
  author_name?: string;
  author_image?: string;
  date?: string;
  image_gallery?: string[];
  created_at: string;
  updated_at?: string;
}

export interface DigitalCampaign {
  id: string;
  title: string;
  video_link?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Corporate {
  id: string;
  name: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Sponsorship {
  id: string;
  name: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  category_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  project_category_id?: string;
  name: string;
  city: string;
  state: string;
  description?: string;
  main_image?: string;
  image_gallery?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ProductFinish {
  product_id: string;
  finish_id: string;
}

export type EntityType =
  | "product-categories"
  | "product-sub-categories"
  | "products"
  | "finishes"
  | "reviews"
  | "exhibitions"
  | "blogs"
  | "digital-campaigns"
  | "corporates"
  | "sponsorships"
  | "project-categories"
  | "projects";
