---
title: 区块颜色自定义
order: 3
---

# 区块颜色自定义

经常会存在根据数值对不同区块给出不同的颜色，可以使用`joinBy`和`fill`实现。

- joinBy 数据关联，将属性数据如何内部空间数据关联绑定
  目前支持 NAME_CHN,adcode 字段连接
  对照表 `Array [string, string]` 第一个值为空间数据字段，第二个为传入数据字段名
- fill 填充配置项 支持数据映射
  - color 图层填充颜色，支持常量和数据映射
    常量：统一设置成一样的颜色
    数据映射
    - field 填充映射字段
    - values 映射值，同 color 方法第二个参数数组，回调函数
  - style 同 polygonLayer 的 style 方法
  - activeColor 鼠标滑过高亮颜色

例如：杭州市各区人口密度

<code src="./examples/fillcolor.jsx">
