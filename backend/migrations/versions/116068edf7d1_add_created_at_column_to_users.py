"""Add created_at column to users

Revision ID: 116068edf7d1
Revises: cc53ca93c163
Create Date: 2026-03-11 16:57:31.687076

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '116068edf7d1'
down_revision = 'cc53ca93c163'
branch_labels = None
depends_on = None


def upgrade():
    # Fix for issues table
    with op.batch_alter_table('issues', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('status', sa.String(length=50), nullable=False, server_default='new')
        )

    # Fix for users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=func.now())
        )
        batch_op.add_column(
            sa.Column('status', sa.String(length=50), nullable=False, server_default='new')
        )
        batch_op.add_column(
            sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.text('0'))
        )


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_admin')
        batch_op.drop_column('status')
        batch_op.drop_column('created_at')

    with op.batch_alter_table('issues', schema=None) as batch_op:
        batch_op.drop_column('status')

    # ### end Alembic commands ##
