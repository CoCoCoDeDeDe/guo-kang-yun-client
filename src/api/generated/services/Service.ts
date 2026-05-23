/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArticleCreate } from '../models/ArticleCreate';
import type { ArticleResponse } from '../models/ArticleResponse';
import type { AuditAction } from '../models/AuditAction';
import type { Body_login_for_access_token_api_v1_users_login_post } from '../models/Body_login_for_access_token_api_v1_users_login_post';
import type { Body_upload_multiple_images_api_v1_upload_images_post } from '../models/Body_upload_multiple_images_api_v1_upload_images_post';
import type { Body_upload_single_image_api_v1_upload_image_post } from '../models/Body_upload_single_image_api_v1_upload_image_post';
import type { BookmarkBatchRequest } from '../models/BookmarkBatchRequest';
import type { BookmarkBatchResponse } from '../models/BookmarkBatchResponse';
import type { BookmarkListResponse } from '../models/BookmarkListResponse';
import type { BookmarkStatusResponse } from '../models/BookmarkStatusResponse';
import type { BookmarkToggleRequest } from '../models/BookmarkToggleRequest';
import type { BookmarkToggleResponse } from '../models/BookmarkToggleResponse';
import type { DailyStats } from '../models/DailyStats';
import type { GovernanceRecordCreate } from '../models/GovernanceRecordCreate';
import type { GovernanceRecordResponse } from '../models/GovernanceRecordResponse';
import type { GovernanceRecordUpdate } from '../models/GovernanceRecordUpdate';
import type { LikeBatchRequest } from '../models/LikeBatchRequest';
import type { LikeBatchResponse } from '../models/LikeBatchResponse';
import type { LikeStatusResponse } from '../models/LikeStatusResponse';
import type { LikeToggleRequest } from '../models/LikeToggleRequest';
import type { LikeToggleResponse } from '../models/LikeToggleResponse';
import type { PasswordResetConfirm } from '../models/PasswordResetConfirm';
import type { PasswordResetRequest } from '../models/PasswordResetRequest';
import type { PestInfoCreate } from '../models/PestInfoCreate';
import type { PestInfoResponse } from '../models/PestInfoResponse';
import type { PestInfoUpdate } from '../models/PestInfoUpdate';
import type { PopularArticle } from '../models/PopularArticle';
import type { PostCreate } from '../models/PostCreate';
import type { PostResponse } from '../models/PostResponse';
import type { RoleEnum } from '../models/RoleEnum';
import type { RoleUpdateRequest } from '../models/RoleUpdateRequest';
import type { SendCodeRequest } from '../models/SendCodeRequest';
import type { StatisticsOverview } from '../models/StatisticsOverview';
import type { Token } from '../models/Token';
import type { UserChangePassword } from '../models/UserChangePassword';
import type { UserCreate } from '../models/UserCreate';
import type { UserListResponse } from '../models/UserListResponse';
import type { UserProfileUpdate } from '../models/UserProfileUpdate';
import type { UserResponse } from '../models/UserResponse';
import type { WarningMessageCreate } from '../models/WarningMessageCreate';
import type { WarningMessageResponse } from '../models/WarningMessageResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class Service {
    /**
     * Test Db Connection
     * 测试数据库连接的 API
     * @returns any Successful Response
     * @throws ApiError
     */
    public static testDbConnectionApiTestDbGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test-db',
        });
    }
    /**
     * 注册第1步：发送注册验证码
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static sendRegisterCodeApiV1UsersSendRegisterCodePost(
        requestBody: SendCodeRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/send-register-code',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 注册第2步：校验验证码并创建账号
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static registerApiV1UsersRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 找回密码第1步：发送重置验证码
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static forgotPasswordApiV1UsersForgotPasswordPost(
        requestBody: PasswordResetRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 找回密码第2步：校验并设置新密码
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetPasswordApiV1UsersResetPasswordPost(
        requestBody: PasswordResetConfirm,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 用户登录 (获取Token)
     * 使用 OAuth2 密码流登录获取 JWT Token。
     * 注意：OAuth2 规范中账号字段名固定为 `username`，前端在这里请传入**邮箱**。
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginForAccessTokenApiV1UsersLoginPost(
        formData: Body_login_for_access_token_api_v1_users_login_post,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取当前登录用户信息
     * 获取当前登录用户自己的信息。
     * 这是一个受保护的接口，必须在 Header 中携带有效的 JWT Token 才能访问。
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static readUsersMeApiV1UsersMeGet(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
        });
    }
    /**
     * 修改当前登录用户的基本资料
     * 修改基本资料，如昵称 (username)、手机号 (phone) 等。
     * 注意：修改密码请走专属的 /change-password 接口。
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateUsersMeApiV1UsersMePut(
        requestBody: UserProfileUpdate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 【权限测试】发布病虫害信息
     * 模拟一个只有专家或管理员才能调用的接口（例如发布新的病虫害科普）。
     * 如果是果农（role=0）调用，会直接返回 403 Forbidden。
     * @returns any Successful Response
     * @throws ApiError
     */
    public static publishPestInfoApiV1UsersExpertPublishPestPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/expert/publish-pest',
        });
    }
    /**
     * 【权限测试】删除用户
     * 模拟一个极其敏感的接口，仅管理员可调用。
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteUserDemoApiV1UsersAdminDeleteUserDelete(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/admin/delete-user',
        });
    }
    /**
     * 修改当前登录用户的密码
     * 修改密码。需要验证旧密码是否正确。
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static changePasswordApiV1UsersChangePasswordPut(
        requestBody: UserChangePassword,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 发布病虫害信息
     * @param requestBody
     * @returns PestInfoResponse Successful Response
     * @throws ApiError
     */
    public static createPestInfoApiV1KnowledgePestsPost(
        requestBody: PestInfoCreate,
    ): CancelablePromise<PestInfoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/knowledge/pests',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取病虫害列表
     * @param skip
     * @param limit
     * @returns PestInfoResponse Successful Response
     * @throws ApiError
     */
    public static readPestsApiV1KnowledgePestsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<PestInfoResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/knowledge/pests',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取病虫害详情
     * @param pestId
     * @returns PestInfoResponse Successful Response
     * @throws ApiError
     */
    public static readPestApiV1KnowledgePestsPestIdGet(
        pestId: number,
    ): CancelablePromise<PestInfoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/knowledge/pests/{pest_id}',
            path: {
                'pest_id': pestId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 更新病虫害信息
     * @param pestId
     * @param requestBody
     * @returns PestInfoResponse Successful Response
     * @throws ApiError
     */
    public static updatePestInfoApiV1KnowledgePestsPestIdPut(
        pestId: number,
        requestBody: PestInfoUpdate,
    ): CancelablePromise<PestInfoResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/knowledge/pests/{pest_id}',
            path: {
                'pest_id': pestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 删除病虫害信息
     * @param pestId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePestInfoApiV1KnowledgePestsPestIdDelete(
        pestId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/knowledge/pests/{pest_id}',
            path: {
                'pest_id': pestId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 提交治理记录
     * 果农提交自己果园的病虫害治理记录及照片
     * @param requestBody
     * @returns GovernanceRecordResponse Successful Response
     * @throws ApiError
     */
    public static createGovernanceRecordApiV1GovernancePost(
        requestBody: GovernanceRecordCreate,
    ): CancelablePromise<GovernanceRecordResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/governance/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取我的治理记录
     * 果农查看自己以往提交的治理记录
     * @param skip
     * @param limit
     * @returns GovernanceRecordResponse Successful Response
     * @throws ApiError
     */
    public static readMyRecordsApiV1GovernanceMeGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<GovernanceRecordResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/governance/me',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取所有果农的治理记录
     * 【仅限专家/管理员】查看所有用户的治理数据
     * @param skip
     * @param limit
     * @returns GovernanceRecordResponse Successful Response
     * @throws ApiError
     */
    public static readAllRecordsApiV1GovernanceAllGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<GovernanceRecordResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/governance/all',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取治理记录详情
     * 获取某条具体的治理记录详情
     * @param recordId
     * @returns GovernanceRecordResponse Successful Response
     * @throws ApiError
     */
    public static readGovernanceRecordApiV1GovernanceRecordIdGet(
        recordId: number,
    ): CancelablePromise<GovernanceRecordResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/governance/{record_id}',
            path: {
                'record_id': recordId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 更新治理状态
     * 修改自己记录的信息，例如将状态从“进行中”修改为“已解决”
     * @param recordId
     * @param requestBody
     * @returns GovernanceRecordResponse Successful Response
     * @throws ApiError
     */
    public static updateGovernanceRecordApiV1GovernanceRecordIdPut(
        recordId: number,
        requestBody: GovernanceRecordUpdate,
    ): CancelablePromise<GovernanceRecordResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/governance/{record_id}',
            path: {
                'record_id': recordId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 删除治理记录
     * 删除自己的某条治理记录
     * @param recordId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteGovernanceRecordApiV1GovernanceRecordIdDelete(
        recordId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/governance/{record_id}',
            path: {
                'record_id': recordId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取单篇文章详情
     * @param articleId
     * @returns ArticleResponse Successful Response
     * @throws ApiError
     */
    public static readArticleApiV1CommunityArticlesArticleIdGet(
        articleId: number,
    ): CancelablePromise<ArticleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/community/articles/{article_id}',
            path: {
                'article_id': articleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 发布科普文章
     * @param requestBody
     * @returns ArticleResponse Successful Response
     * @throws ApiError
     */
    public static createArticleApiV1CommunityArticlesPost(
        requestBody: ArticleCreate,
    ): CancelablePromise<ArticleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/community/articles',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 浏览科普文章
     * 任何登录用户都可以浏览已经【通过审核(PUBLISHED)】的文章
     * @param skip
     * @param limit
     * @returns ArticleResponse Successful Response
     * @throws ApiError
     */
    public static readArticlesApiV1CommunityArticlesGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<ArticleResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/community/articles',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取单条帖子详情
     * @param postId
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static readPostApiV1CommunityPostsPostIdGet(
        postId: number,
    ): CancelablePromise<PostResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/community/posts/{post_id}',
            path: {
                'post_id': postId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 发布互动帖子
     * @param requestBody
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static createPostApiV1CommunityPostsPost(
        requestBody: PostCreate,
    ): CancelablePromise<PostResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/community/posts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 浏览互动帖子
     * 任何登录用户都可以浏览已经【通过审核(PUBLISHED)】的帖子
     * @param skip
     * @param limit
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static readPostsApiV1CommunityPostsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<PostResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/community/posts',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取待审核内容
     * @param targetType
     * @param skip
     * @param limit
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPendingListApiV1CommunityAuditPendingGet(
        targetType: string,
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/community/audit/pending',
            query: {
                'target_type': targetType,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 执行内容审核
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static executeAuditActionApiV1CommunityAuditPost(
        requestBody: AuditAction,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/community/audit',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 发布病虫害预警
     * 【限专家/管理员】发布一条新的病虫害预警。
     * 发布成功后，系统会在后台自动向用户发送广播邮件。
     * @param requestBody
     * @returns WarningMessageResponse Successful Response
     * @throws ApiError
     */
    public static publishWarningApiV1WarningPost(
        requestBody: WarningMessageCreate,
    ): CancelablePromise<WarningMessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/warning/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取当前生效预警
     * 所有登录用户均可查看当前仍在有效期内的预警信息
     * @param skip
     * @param limit
     * @returns WarningMessageResponse Successful Response
     * @throws ApiError
     */
    public static readActiveWarningsApiV1WarningActiveGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<WarningMessageResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/warning/active',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 获取单条预警详情
     * 所有登录用户均可通过 ID 查看预警的具体内容
     * @param warningId
     * @returns WarningMessageResponse Successful Response
     * @throws ApiError
     */
    public static readWarningApiV1WarningWarningIdGet(
        warningId: number,
    ): CancelablePromise<WarningMessageResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/warning/{warning_id}',
            path: {
                'warning_id': warningId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 删除预警信息
     * 【限专家/管理员】删除某条预警
     * @param warningId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteWarningApiV1WarningWarningIdDelete(
        warningId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/warning/{warning_id}',
            path: {
                'warning_id': warningId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 通用单图上传
     * 适用于知识库封面、用户头像、富文本单张插图等场景。
     * 返回示例: {"image_url": "/static/uploads/xxxxx.jpg"}
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadSingleImageApiV1UploadImagePost(
        formData: Body_upload_single_image_api_v1_upload_image_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/image',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 通用多图上传
     * 适用于治理记录等多图场景。
     * 返回示例: {"image_urls": ["/static/uploads/1.jpg", "/static/uploads/2.jpg"]}
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadMultipleImagesApiV1UploadImagesPost(
        formData: Body_upload_multiple_images_api_v1_upload_images_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/upload/images',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 点赞/取消点赞 (Toggle)
     * @param requestBody
     * @returns LikeToggleResponse Successful Response
     * @throws ApiError
     */
    public static toggleLikeApiV1LikeTogglePost(
        requestBody: LikeToggleRequest,
    ): CancelablePromise<LikeToggleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/like/toggle',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询点赞状态
     * @param targetType
     * @param targetId
     * @returns LikeStatusResponse Successful Response
     * @throws ApiError
     */
    public static getLikeStatusApiV1LikeStatusGet(
        targetType: string,
        targetId: number,
    ): CancelablePromise<LikeStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/like/status',
            query: {
                'target_type': targetType,
                'target_id': targetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 批量查询点赞状态
     * @param requestBody
     * @returns LikeBatchResponse Successful Response
     * @throws ApiError
     */
    public static batchLikeStatusApiV1LikeBatchPost(
        requestBody: LikeBatchRequest,
    ): CancelablePromise<LikeBatchResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/like/batch',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 收藏/取消收藏 (Toggle)
     * @param requestBody
     * @returns BookmarkToggleResponse Successful Response
     * @throws ApiError
     */
    public static toggleBookmarkApiV1BookmarkTogglePost(
        requestBody: BookmarkToggleRequest,
    ): CancelablePromise<BookmarkToggleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/bookmark/toggle',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 查询收藏状态
     * @param targetType
     * @param targetId
     * @returns BookmarkStatusResponse Successful Response
     * @throws ApiError
     */
    public static getBookmarkStatusApiV1BookmarkStatusGet(
        targetType: string,
        targetId: number,
    ): CancelablePromise<BookmarkStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/bookmark/status',
            query: {
                'target_type': targetType,
                'target_id': targetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 批量查询收藏状态
     * @param requestBody
     * @returns BookmarkBatchResponse Successful Response
     * @throws ApiError
     */
    public static batchBookmarkStatusApiV1BookmarkBatchPost(
        requestBody: BookmarkBatchRequest,
    ): CancelablePromise<BookmarkBatchResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/bookmark/batch',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 我的收藏列表
     * @param targetType
     * @param skip
     * @param limit
     * @returns BookmarkListResponse Successful Response
     * @throws ApiError
     */
    public static readMyBookmarksApiV1BookmarkMeGet(
        targetType?: string,
        skip?: number,
        limit: number = 20,
    ): CancelablePromise<BookmarkListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/bookmark/me',
            query: {
                'target_type': targetType,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 平台数据总览
     * @returns StatisticsOverview Successful Response
     * @throws ApiError
     */
    public static getStatisticsOverviewApiV1StatisticsOverviewGet(): CancelablePromise<StatisticsOverview> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/overview',
        });
    }
    /**
     * 热门文章（按浏览量）
     * @param limit
     * @returns PopularArticle Successful Response
     * @throws ApiError
     */
    public static getPopularArticlesApiV1StatisticsPopularArticlesGet(
        limit: number = 10,
    ): CancelablePromise<Array<PopularArticle>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/popular/articles',
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 热门内容（按点赞数）
     * @param targetType
     * @param limit
     * @returns PopularArticle Successful Response
     * @throws ApiError
     */
    public static getPopularByLikesApiV1StatisticsPopularByLikesGet(
        targetType: string,
        limit: number = 10,
    ): CancelablePromise<Array<PopularArticle>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/popular/by-likes',
            query: {
                'target_type': targetType,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 今日新增数据
     * @returns DailyStats Successful Response
     * @throws ApiError
     */
    public static getDailyStatsApiV1StatisticsDailyGet(): CancelablePromise<DailyStats> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/daily',
        });
    }
    /**
     * 管理员获取用户列表
     * 仅限管理员访问。支持按角色筛选和邮箱/昵称搜索。
     * @param role
     * @param search
     * @param skip
     * @param limit
     * @returns UserListResponse Successful Response
     * @throws ApiError
     */
    public static readUsersAdminListApiV1UsersAdminListGet(
        role?: (RoleEnum | null),
        search?: string,
        skip?: number,
        limit: number = 20,
    ): CancelablePromise<UserListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/admin/list',
            query: {
                'role': role,
                'search': search,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 修改用户角色
     * 仅限管理员访问。安全约束：不能修改自己的角色，不能修改其他 ADMIN 的角色，不能将任何人设为 ADMIN，只能将 FARMER ↔ EXPERT 互转。
     * @param userId
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateUserRoleApiV1UsersAdminUserIdRolePut(
        userId: number,
        requestBody: RoleUpdateRequest,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/admin/{user_id}/role',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
