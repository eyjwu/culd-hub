import React, {useContext, useState} from "react";
import {Divider, Input, Layout, Select, Space, Typography} from "antd";
import {UserOutlined} from "@ant-design/icons";
import UserContext from "../context/UserContext";
import Header from "../components/Header";
import ProfileItem from "../components/ProfileItem";
import {gql} from "@apollo/client";
import Loader from "../components/Loader";
import useAuthQuery from "../utils/useAuthQuery";


const GET_SCHOOL_CHOICES_QUERY = gql`
	{
		schoolChoices
	}
`;

const GET_CLASS_YEAR_CHOICES_QUERY = gql`
	{
		classYearChoices
	}
`;

const ProfilePage = () => {
    let {user} = useContext(UserContext);
    let [schoolChoices, setSchoolChoices] = useState(null);
    let [classYearChoices, setClassYearChoices] = useState(null);

    let {schoolChoicesLoading} = useAuthQuery(GET_SCHOOL_CHOICES_QUERY, {
        onCompleted: ({schoolChoices}) => {
            setSchoolChoices(JSON.parse(schoolChoices));
        },
    });

    let {classYearChoicesLoading} = useAuthQuery(GET_CLASS_YEAR_CHOICES_QUERY, {
        onCompleted: ({classYearChoices}) => {
            setClassYearChoices(JSON.parse(classYearChoices));
        },
    });

    return classYearChoicesLoading || !classYearChoices ||
    schoolChoicesLoading || !schoolChoices ? (
        <Loader/>
    ) : (
        <Layout style={{minHeight: "100vh"}}>
            <Header/>
            <Layout.Content
                style={{
                    width: "40%",
                    margin: "auto",
                    padding: "30px",
                }}
            >
                <Typography.Title level={2} style={{marginBottom: "0em"}}>
                    <UserOutlined
                        style={{
                            fontSize: "0.9em",
                            marginRight: "0.4em",
                        }}
                    />
                    Your Member Profile
                </Typography.Title>
                <Divider style={{marginTop: "0.8em", marginBottom: "1.2em"}}/>
                <Space style={{width: "100%"}} direction="vertical">
                    <ProfileItem
                        title="Full Name"
                        value={`${user.firstName} ${user.lastName}`}
                        input={
                            <Input.Group compact style={{width: "calc(100% - 50px)"}}>
                                <Input
                                    placeholder="First name"
                                    defaultValue={user.firstName}
                                    style={{width: "50%"}}
                                />
                                <Input
                                    placeholder="Last name"
                                    defaultValue={user.lastName}
                                    style={{width: "50%"}}
                                />
                            </Input.Group>
                        }
                    />
                    <ProfileItem
                        title="Email Address"
                        value={user.email}
                        input={
                            <Input
                                placeholder="Email address"
                                defaultValue={user.email}
                                style={{width: "calc(100% - 50px)"}}
                            />
                        }
                    />
                    <ProfileItem
                        title="Phone Number"
                        value={user.phone || "Not set"}
                        input={
                            <Input
                                placeholder="Phone number"
                                defaultValue={user.phone}
                                style={{width: "calc(100% - 50px)"}}
                            />
                        }
                    />
                    <ProfileItem
                        title="School"
                        value={user.member.school || "Not set"}
                        choices={schoolChoices}
                        input={
                            <Select
                                placeholder="School"
                                defaultValue={schoolChoices ?
                                    schoolChoices[user.member.school] ?? user.member.school
                                    : user.member.school}
                                style={{width: "calc(100% - 50px)"}}
                            >
                                <>
                                    {Object.entries(schoolChoices).map(([key, value]) =>
                                        <Select.Option key={key} value={key}>{value.toString()}</Select.Option>
                                    )}
                                </>
                            </Select>
                        }
                    />
                    <ProfileItem
                        title="Class Year"
                        value={user.member.classYear || "Not set"}
                        choices={classYearChoices}
                        input={
                            <Select
                                placeholder="Class year"
                                defaultValue={classYearChoices ?
                                    classYearChoices[user.member.classYear] ?? user.member.school
                                    : user.member.classYear}
                                style={{width: "calc(100% - 50px)"}}
                            >
                                <>
                                    {Object.entries(classYearChoices).map(([key, value]) =>
                                        <Select.Option key={key} value={key}>{value.toString()}</Select.Option>
                                    )}
                                </>
                            </Select>
                        }
                    />
                </Space>
            </Layout.Content>
        </Layout>
    );
};

export default ProfilePage;

// eslint-disable-next-line
{
    /* <Form form={form} name="register" onFinish={onFinish}>
<Form.Item>
    <Input.Group compact>
        <Form.Item
            name="first_name"
            rules={[
                {
                    required: true,
                    message: "Please enter your first name.",
                },
            ]}
            normalize={toTitleCase}
            noStyle
        >
            <Input
                prefix={<UserOutlined />}
                placeholder="First name"
                style={{ width: "50%" }}
            />
        </Form.Item>
        <Form.Item
            name="last_name"
            rules={[
                { required: true, message: "Please enter your last name." },
            ]}
            normalize={toTitleCase}
            noStyle
        >
            <Input placeholder="Last name" style={{ width: "50%" }} />
        </Form.Item>
    </Input.Group>
</Form.Item>
<Form.Item
    name="email"
    rules={[
        {
            type: "email",
            message: "This is not a valid email address.",
        },
        { required: true, message: "Please enter your email address." },
    ]}
    validateStatus={invalidEmail ? "error" : ""}
    hasFeedback={invalidEmail}
    onChange={onChange}
    normalize={toLowerCase}
>
    <Input prefix={<MailOutlined />} placeholder="Email address" />
</Form.Item>
<Form.Item
    name="phone_number"
    rules={[
        {
            pattern: new RegExp(
                /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/g
            ),
            message: "This is not a valid phone number.",
        },
    ]}
>
    <Input placeholder="Phone number" prefix={<PhoneOutlined />} />
</Form.Item>
<Form.Item
    name="password"
    rules={[
        { required: true, message: "Please enter your password." },
    ]}
    hasFeedback
>
    <Input.Password
        prefix={<LockOutlined />}
        placeholder="Password"
    />
</Form.Item>
<Form.Item
    name="confirm"
    depndencies={["password"]}
    rules={[
        { required: true, message: "Please confirm your password." },
        ({ getFieldValue }) => ({
            validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                }

                return Promise.reject(
                    new Error(
                        "The two passwords that you entered do not match."
                    )
                );
            },
        }),
    ]}
    hasFeedback
>
    <Input.Password
        prefix={<LockOutlined />}
        placeholder="Confirm password"
    />
</Form.Item>
<Form.Item shouldUpdate>
    {() => (
        <Button
            type="primary"
            htmlType="submit"
            disabled={
                !form.isFieldsTouched(
                    [
                        "first_name",
                        "last_name",
                        "email",
                        "password",
                        "confirm",
                    ],
                    true
                ) ||
                !!form
                    .getFieldsError()
                    .filter(({ errors }) => errors.length).length
            }
            style={{ width: "100%" }}
        >
            Register
        </Button>
    )}
</Form.Item>
</Form> */
}
